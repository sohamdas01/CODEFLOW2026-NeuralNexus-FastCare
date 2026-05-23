from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pdfplumber
import spacy
import io
import json
import re
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image

app = FastAPI(title="FastCare NLP Ingestion Service")

# Load local medical NER model into memory during server startup
try:
    nlp = spacy.load("en_ner_bionlp13cg_md")
except OSError:
    pass

class MedicalEntity(BaseModel):
    entity: str
    source: str
    page: int

class MedicalHistory(BaseModel):
    physiological_conditions: List[MedicalEntity]
    allergies: List[MedicalEntity]
    regular_medicines: List[MedicalEntity]

class ProcessedRecord(BaseModel):
    filename: str
    date: Optional[str] = None
    medical_history: MedicalHistory
    raw_text: str

class IngestionResponse(BaseModel):
    patient: Dict[str, Any]
    records: List[ProcessedRecord]

def extract_date(text: str) -> Optional[str]:
    """
    Surgically extract the most likely document date.
    Prioritizes keywords like 'Admission Date' or 'Discharge Date' and ignores watermarks.
    """
    # 1. Clean text: Strip common watermarks that contain irrelevant dates
    cleaned_text = re.sub(r'Downloaded from.*Wiley Online Library on.*?\b', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # 2. Scope: Document dates usually appear at the top. Use the first 2000 chars.
    header_scope = cleaned_text[:2000]

    # 3. Flexible Date Regex (handles potential spaces like '3 / 4 / 2003')
    # \s* allowed around separators
    d_sep = r'\s*[/-]\s*'
    date_v1 = rf'\b\d{{1,2}}{d_sep}\d{{1,2}}{d_sep}\d{{2,4}}\b'
    date_v2 = rf'\b\d{{4}}{d_sep}\d{{1,2}}{d_sep}\d{{1,2}}\b'
    date_v3 = r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b'

    # Look for dates associated with specific clinical headers first
    priority_patterns = [
        rf'(?:Admission|Discharge|Service|Visit|Date|Prescribed)\s*Date[:\s]*({date_v1})',
        rf'(?:Admission|Discharge|Service|Visit|Date|Prescribed)\s*Date[:\s]*({date_v2})',
        rf'(?:Admission|Discharge|Service|Visit|Date|Prescribed)\s*Date[:\s]*({date_v3})'
    ]
    
    for pattern in priority_patterns:
        matches = re.findall(pattern, header_scope, re.IGNORECASE)
        if matches:
            # Clean up potential spaces in the result
            return re.sub(r'\s+', '', matches[0])

    # Fallback to any date pattern in the header
    for pattern in [date_v1, date_v2, date_v3]:
        matches = re.findall(pattern, header_scope, re.IGNORECASE)
        if matches:
            return re.sub(r'\s+', '', matches[0])
            
    return None

async def extract_text_from_page(page, page_image: Optional[Image.Image] = None) -> str:
    """
    Extract text from a page. Fallback to OCR if digital extraction yields insufficient text.
    """
    text = page.extract_text(layout=True) or ""
    
    # If text is too short or empty, it's likely a scan/handwritten record
    if len(text.strip()) < 50 and page_image:
        # Perform OCR on the corresponding image
        text = pytesseract.image_to_string(page_image)
        
    return text

@app.post("/process-documents", response_model=IngestionResponse)
async def process_documents(
    patient_name: str = Form(...),
    patient_details: str = Form(...),
    files: List[UploadFile] = File(...)
):
    processed_records = []
    
    try:
        details = json.loads(patient_details)
    except json.JSONDecodeError:
        details = {"raw_details": patient_details}

    for file in files:
        if not file.filename.endswith('.pdf'):
            continue

        raw_text = ""
        physiological_conditions = []
        allergies = []
        regular_medicines = []
        doc_date = None

        try:
            contents = await file.read()
            
            # Convert PDF to images for potential OCR fallback
            # We do this upfront if we suspect scans, or page-by-page if needed.
            # To be efficient, we only convert if digital extraction fails.
            images = []
            
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    page_image = None
                    
                    # Try digital extraction first
                    page_text = page.extract_text(layout=True) or ""
                    
                    if len(page_text.strip()) < 50:
                        # Fallback to OCR: Convert only the necessary page to image
                        if not images:
                            # Lazy conversion of all pages if we hit a scan
                            images = convert_from_bytes(contents)
                        
                        if len(images) >= page_num:
                            page_image = images[page_num - 1]
                            page_text = pytesseract.image_to_string(page_image)

                    if page_text:
                        # Extract date from the first page or the first available date
                        if not doc_date:
                            doc_date = extract_date(page_text)

                        raw_text += f"\n--- [START SOURCE: {file.filename} | PAGE: {page_num}] ---\n"
                        raw_text += page_text
                        raw_text += f"\n--- [END SOURCE: {file.filename} | PAGE: {page_num}] ---\n"

                        doc = nlp(page_text)
                        for ent in doc.ents:
                            entity_obj = MedicalEntity(
                                entity=ent.text,
                                source=file.filename,
                                page=page_num
                            )

                            if ent.label_ in ["DISEASE_OR_SYNDROME", "PATHOLOGICAL_FORMATION"]:
                                physiological_conditions.append(entity_obj)
                            elif ent.label_ == "SIMPLE_CHEMICAL":
                                allergies.append(entity_obj)
                                regular_medicines.append(entity_obj)
            
            def deduplicate(entities):
                seen = set()
                unique = []
                for e in entities:
                    key = (e.entity, e.page)
                    if key not in seen:
                        unique.append(e)
                        seen.add(key)
                return unique

            processed_records.append(ProcessedRecord(
                filename=file.filename,
                date=doc_date,
                medical_history=MedicalHistory(
                    physiological_conditions=deduplicate(physiological_conditions),
                    allergies=deduplicate(allergies),
                    regular_medicines=deduplicate(regular_medicines)
                ),
                raw_text=raw_text
            ))

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process {file.filename}: {str(e)}")

    return IngestionResponse(
        patient={
            "name": patient_name,
            "details": details
        },
        records=processed_records
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
