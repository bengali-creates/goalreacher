"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, PlusCircle, X, Loader2, Pencil } from "lucide-react"; // Added Pencil
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { entrySchema } from "@/lib/schema";
import { improveWithAI } from "actions/resume";
import z from "zod";

type Entry = z.infer<typeof entrySchema>;

interface EntryFormProps {
  type: "experience" | "education" | "projects";
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
}

export function EntryForm({ type, entries = [], onChange }: EntryFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const entryForm = useForm<Entry>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  });

  const { watch, setValue, handleSubmit, control, reset } = entryForm;

  const current = watch("current");
  const descriptionValue = watch("description");

  const { mutate: improveDescription, isPending: isImproving } = useMutation({
    mutationFn: async (text: string) => {
      return await improveWithAI({
        current: text,
        type: type.toLowerCase(),
      });
    },
    onSuccess: (data) => {
      setValue("description", data!);
      toast.success("AI has refined your description!");
    },
    onError: (error: any) => {
      toast.error(error.message || "AI improvement failed");
    },
  });


  const handleSave = handleSubmit((data) => {
    const formattedEntry: Entry = {
      ...data,
      endDate: data.current ? "" : data.endDate,
    };

    if (editingIndex !== null) {
      const newEntries = [...entries];
      newEntries[editingIndex] = formattedEntry;
      onChange(newEntries);
    } else {
      onChange([...entries, formattedEntry]);
    }

    handleCancel();
  });

  const handleEdit = (index: number) => {
    const entry = entries[index];
    setEditingIndex(index);
    setIsAdding(true);
    reset(entry); 
  };

  const handleDelete = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleCancel = () => {
    reset({
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* List of existing entries */}
      <div className="space-y-3">
        {entries.map((item, index) => (
          editingIndex!=index &&(
          <Card key={index} className="bg-muted/40 overflow-hidden border-muted-foreground/10">
            <CardHeader className="flex flex-row items-start justify-between py-4 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold">
                  {item.title}
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.organization}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {formatDate(item.startDate)} — {item.current ? "Present" : formatDate(item.endDate)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" type="button" onClick={() => handleEdit(index)}>
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" type="button" onClick={() => handleDelete(index)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                {item.description}
              </p>
            </CardContent>
          </Card>)
        ))}
      </div>

      {/* Editor Form */}
      {isAdding ? (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-primary">
              {editingIndex !== null ? `Edit ${type}` : `Add New ${type}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...entryForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title / Position</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Software Engineer" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="organization" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization / Company</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Google" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl><Input type="month" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl><Input type="month" {...field} disabled={current} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={control} name="current" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-1">
                  <FormControl>
                    <input 
                       type="checkbox" 
                       checked={field.value} 
                       onChange={field.onChange} 
                       className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">I currently work/study here</FormLabel>
                </FormItem>
              )} />

              <FormField control={control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea {...field} className="h-32 resize-none" placeholder="Describe your responsibilities and achievements..." />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                        onClick={() => improveDescription(descriptionValue)} 
                        disabled={isImproving || !descriptionValue}
                      >
                        {isImproving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        {isImproving ? "AI is thinking..." : "Improve with AI"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Form>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-muted/20 p-3">
            <Button variant="ghost" type="button" onClick={handleCancel}>Cancel</Button>
            <Button type="button" onClick={handleSave}>
               {editingIndex !== null ? "Update" : "Save"} {type}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button variant="outline" className="w-full border-dashed py-6" onClick={() => setIsAdding(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add {type}
        </Button>
      )}
    </div>
  );
}