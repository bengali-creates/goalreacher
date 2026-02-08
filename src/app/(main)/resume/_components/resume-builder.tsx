"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Download,
  Save,
  Loader2,
  Edit,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

import { resumeSchema,Entry } from "@/lib/schema";
import { saveResume } from "actions/resume";
import { entriesToMarkdown } from "@/app/lib/helper";
import type { ResumeSchema } from "@/lib/authicator";
import { useUser } from "@clerk/nextjs";
import { EntryForm } from "./entry-form";

interface ResumeBuilderProps {
  initialContent: string;
  user: { fullName?: string } | null;
}

const ResumeBuilder = ({ initialContent }: any) => {
  console.log('first', initialContent)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [resumeMode, setResumeMode] = useState<"preview" | "edit">("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useUser();

  const form = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues:initialContent
  });

   const formValues = form.watch();
  console.log('formvalue', formValues)

    const { mutate: saveResult, isPending: savingResult } = useMutation({
      mutationFn: async () => {
        const normalizedData = {
          ...formValues,
          experience: formValues.experience.map((exp:Entry) => ({
            ...exp,
            current: exp.current ?? false,
          })),
          education: formValues.education.map((edu:Entry) => ({
            ...edu,
            current: edu.current ?? false,
          })),
          projects: formValues.projects.map((proj:Entry) => ({
            ...proj,
            current: proj.current ?? false,
          })),
        } as ResumeSchema;
        return await saveResume(normalizedData);
      },
      onSuccess: () => toast.success("Resume saved successfully!"),
      onError: (error: Error) =>
        toast.error(error.message || "Failed to save resume"),
    });

 

  // Helper: Generate Contact Markdown
  const getContactMarkdown = () => {
    const { contactInfo } = formValues as {
      contactInfo?: {
        email?: string;
        mobile?: string;
        linkedin?: string;
        twitter?: string;
      };
    };
    const parts = [];
    if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user?.fullName || "Resume"}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  // Helper: Combine all sections
  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  // Sync Form to Markdown
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent || initialContent);
    }
  }, [formValues, activeTab]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15] as [number, number],
        filename: "resume.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };
      await html2pdf().set(opt).from(element!).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={() => saveResult()}
            disabled={savingResult}
          >
            {savingResult ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
      >
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Enter your professional social accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email@example.com"  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 234..."  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X (Twitter)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-32"
                            placeholder="Tell your story..."
                           
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-32"
                            placeholder="React, Next.js, Tailwind..."
                           
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <EntryForm
                            type="experience"
                            entries={field.value}
                            onChange={field.onChange}
                            // initialContent={initialContent.experience}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="projects"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <EntryForm
                            type="projects"
                            entries={field.value}
                            onChange={field.onChange}
                            // initialContent={initialContent.projects}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <EntryForm
                            type="education"
                            entries={field.value}
                            onChange={field.onChange}
                            // initialContent={initialContent.education}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Edit Markdown
                </>
              ) : (
                <>
                  <Monitor className="mr-2 h-4 w-4" /> Preview
                </>
              )}
            </Button>
          </div>

          {resumeMode === "edit" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                Manual edits here will be lost if you update the Form tab.
              </span>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <MDEditor
              value={previewContent}
              onChange={(v) => setPreviewContent(v || "")}
              height={800}
              preview={resumeMode}
            />
          </div>

          {/* Hidden Print Container */}
          <div className="hidden">
            <div id="resume-pdf" className="p-8 bg-white text-black">
              <MDEditor.Markdown
                source={previewContent}
                style={{ background: "white", color: "black" }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
