"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InternshipCard } from "@/components/internship-card"
import { Target, Search, Filter, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import type { Internship } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [remoteFilter, setRemoteFilter] = useState("all")
  const [skillsFilter, setSkillsFilter] = useState("")

  useEffect(() => {
    loadInternships()
  }, [searchTerm, locationFilter, remoteFilter, skillsFilter])

  const loadInternships = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from("Internship_Data").select("*") // replace with exact table name

      if (searchTerm) query = query.ilike("Job Title", `%${searchTerm}%`)       // works
      if (locationFilter) query = query.ilike("Location", `%${locationFilter}%`) // works
      if (remoteFilter !== "all") query = query.eq("Remote", remoteFilter === "true") // works
      if (skillsFilter) query = query.contains("Skills", [skillsFilter]) 
     
      const { data, error } = await query

      if (error) {
        console.error("Error fetching internships:", error.message)
        setInternships([])
      } else {
    // Map DB columns to match Internship type
    const mappedData: Internship[] = data.map((row) => ({
      id: row.id,
      company_id: row.company_id ?? "", // fallback if missing
      title: row["Job Title"] ?? "",
      requirements: row.requirements ?? "",
      skills_required: row.skills_required ?? [],
      location: row.Location ?? "",
      postedDate: row["Posted Date"] ?? "",
      deadline: row.Deadline ?? "",
      company: row.Company ?? "",
      jobUrl: row["Job URL"] ?? "",
      department: row.Department ?? "",
      stipend: row.Stipend ?? "",
      description: row["Brief Description"] ?? "",
      skills: row.Skills ?? [],
      remote: row.Remote ?? false,
      stipend_currency: row.stipend_currency ?? "",
      is_active: row.is_active ?? true,
      created_at: row.created_at ?? "",
      updated_at: row.updated_at ?? "",
    }))
    setInternships(mappedData)
}

    } catch (err) {
      console.error("Unexpected error:", err)
      setInternships([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MatchMySkills</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/internships" className="text-foreground font-medium">
              Browse
            </Link>
            <Link href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
              Applications
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            Browse Internships
          </h1>
          <p className="text-muted-foreground">Discover amazing internship opportunities from top companies.</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <CardDescription>Refine your search to find the perfect internship match.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="City, State"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Work Type</label>
                <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="true">Remote</SelectItem>
                    <SelectItem value="false">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <Input
                  placeholder="e.g., JavaScript, Python"
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <span>Loading internships...</span>
          </div>
        ) : internships.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No internships found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your filters or search terms to find more opportunities.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                  setRemoteFilter("all")
                  setSkillsFilter("")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
