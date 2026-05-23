import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/lib/data";


export default function Home() {
  return <div className="bg-background">
    <section className="relative overflow-hidden py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline"
            className='bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400
            text-sm font-medium'
            >Healthcare made simple</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              A healthcare <br /> 
              <span className="gradient-title">management system</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-md leading-relaxed">
              FastCare transforms fragmented medical records into clear, AI-powered clinical insights. 
              Helping doctors access critical patient history instantly during emergencies.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-2xl font-semibold">
                <Link href={"/patient"}>
                Get Started <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-100 lg:h-125">
            <Image
                src="/doctor.jpg"
                alt="Doctor consultation"
                fill
                priority
                className="object-cover md:pt-14 rounded-xl"
            />
          </div>
        </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-1 rounded-full">
              Success Stories
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold text-[#f0fdf4]">
              What Our Users Say
            </h2>

            <p className="mt-4 text-lg text-[#6b7280]">
              Hear from patients and doctors who use our platform
            </p>
          </div>

          {/* Cards */}
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="bg-[#111111] border border-[#1f2d1f] rounded-2xl hover:border-green-800 hover:shadow-[0_0_20px_rgba(22,163,74,0.08)] transition-all duration-200"
              >
                <CardContent className="p-6">

                  {/* Top */}
                  <div className="flex items-start gap-4">

                    {/* Circle */}
                    <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                      <span className="text-green-400 font-bold text-sm tracking-wider">
                        {item.initials}
                      </span>
                    </div>

                    {/* Name + Role */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#f0fdf4]">
                        {item.name}
                      </h3>

                      <p className="text-sm text-[#6b7280]">
                        {item.role}
                      </p>
                    </div>

                  </div>

                  {/* Quote */}
                  <p className="mt-6 text-[#a1a1aa] leading-relaxed text-[15px]">
                    &quot;{item.quote}&quot;
                  </p>

                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>
  </div>
};

