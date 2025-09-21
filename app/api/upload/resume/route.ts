import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    //check user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("resume") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    //  validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or Word document." },
        { status: 400 }
      )
    }

    // validate size
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Please upload a file smaller than 5MB." },
        { status: 400 }
      )
    }

    // unique path
    const fileExtension = file.name.split(".").pop()
    const fileName = `${user.id}/resume_${Date.now()}.${fileExtension}`

    // convert file → Buffer for supabase-js
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // get public URL
    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName)
    const publicUrl = data.publicUrl

    // update user profile
    const { error: updateError } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      resume_url: publicUrl,
    })

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // parse resume content (stubbed)
    const resumeText = await extractTextFromFile(file)
    const parsedData = parseResumeText(resumeText)

    return NextResponse.json({
      message: "Resume uploaded successfully",
      resume_url: publicUrl,
      parsed_data: parsedData,
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return "Sample extracted text from PDF resume..."
  } else if (file.type.includes("word")) {
    return "Sample extracted text from Word resume..."
  }
  return ""
}

function parseResumeText(text: string) {
  const commonSkills = ["JavaScript", "Python", "Java", "C++", "React", "Node.js", "SQL", "AWS"]
  const foundSkills = commonSkills.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))

  const experienceKeywords = ["intern", "developer", "engineer", "analyst", "designer"]
  const experience = experienceKeywords.filter((k) => text.toLowerCase().includes(k))

  const educationKeywords = ["university", "college", "bachelor", "master", "degree"]
  const education = educationKeywords.filter((k) => text.toLowerCase().includes(k))

  return { skills: foundSkills, experience, education }
}
