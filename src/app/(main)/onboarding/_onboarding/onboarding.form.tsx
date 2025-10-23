"use client"
import { Industry,Industries } from "@/data/industries";
import { onboardingSchema } from "@/lib/authicator";
   import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState ,useEffect} from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { CircleX } from "lucide-react";
import { updateUser } from "actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type subIndustry=string[]

export type OnboardingFormValues = {
  industry: string;
  subIndustry: string;
  experience: number;      // number
  skills: string[];        // array of strings
  bio?: string;
};

const OnboardingForm = ({ industries }: Industries) => {
  const router=useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sellectedIndustry, setSellectedIndustry] = useState<subIndustry>([])
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      experience: 0,
      skills: [],
      bio: "",
    },
  });

  const industry=form.watch("industry");
  const onSubmit = async (data: OnboardingFormValues) => {
    console.log("form data:", data);
    try{
    
    const formattedIndustry = `${data.industry}-${data.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;
      
    await updateUser({
      ...data,
      industry: formattedIndustry,
    });
  setIsLoading(false)
  }
    catch (error) {
      console.error("Onboarding error:", error);
    }
  };
 useEffect(() => {
    if (!isLoading) {
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [isLoading, router]);
 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome! Complete Your Profile</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-8">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Industry</FormLabel>
                  <FormControl>
                    {/* wire the select: value + onValueChange */}
                    <Select
                      value={field.value}
                       onValueChange={(val: string) => {field.onChange(val)
                        setSellectedIndustry(
  industries.find((ind) => ind.name === val)?.subIndustries || []
                  );
                console.log('sellectedIndustry', sellectedIndustry)}}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind: Industry) => (
                          <SelectItem key={ind.id} value={ind.name}>
                            {ind.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
{
  industry && (<FormField
              control={form.control}
              name="subIndustry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Specialization</FormLabel>
                  <FormControl>
                    {/* wire the select: value + onValueChange */}
                    <Select
                      value={field.value}
                       onValueChange={(val: string) => {field.onChange(val)
                        
                  }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellectedIndustry?.map((ind: string) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />)
}
            {/* Add other fields similarly. Example: experience (number) */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (years)</FormLabel>
                  <FormControl>
                    <Input type="number"
                     {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="input-class">
                      
                    </Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    {/* wire the select: value + onValueChange */}
<Input type="text"
 placeholder="enter your bio " 
 {...field}>
</Input>
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

 <FormField
  control={form.control}
  name="skills"
  render={({ field }) => {
    const [inputText, setInputText] = useState("");

    // helper: parse a string into cleaned tags
    const parseToTags = (raw: string) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    // add parsed tags to field.value (avoids duplicates, preserves order)
    const addTags = (raw: string) => {
      const parts = parseToTags(raw);
      if (parts.length === 0) return;
      const combined = [...field.value, ...parts];
      // remove duplicates while preserving order
      const unique = Array.from(new Set(combined));
      field.onChange(unique);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If user types comma or presses Enter, commit the buffer as tags
      if (e.key === "," || e.key === "Enter" || e.key === "Tab") {
        e.preventDefault(); // stop the comma from being inserted into the input
        addTags(inputText);
        setInputText("");
      }
      // Backspace behavior: if input is empty, remove last tag
      if (e.key === "Backspace" && inputText === "" && field.value.length) {
        const copy = [...field.value];
        copy.pop();
        field.onChange(copy);
      }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // If user typed a comma as part of paste or fast typing,
      // detect and immediately commit any comma-separated parts.
      const val = e.target.value;
      if (val.includes(",")) {
        addTags(val);
        setInputText("");
      } else {
        setInputText(val);
      }
    };

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      if (pasted.includes(",")) {
        e.preventDefault();
        addTags(pasted);
        setInputText("");
      }
    };

    const removeTag = (idx: number) => {
      const copy = [...field.value];
      copy.splice(idx, 1);
      field.onChange(copy);
    };

    return (
      <FormItem>
        <FormLabel>Skills</FormLabel>
        <FormControl>
          <div className="flex flex-col gap-2">
            {/* Tag row */}
            <div className="flex flex-wrap gap-2">
               
              {field.value.map((tag: string, i: number) => (
                <Item variant="muted"
                key={tag + "-" + i}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full">
        <ItemContent>
          {/* <ItemTitle>Muted Variant</ItemTitle>
          <ItemDescription>
            Subdued appearance with muted colors for secondary content.
          </ItemDescription> */}
          {tag}
        </ItemContent>
        <ItemActions onClick={() => removeTag(i)}>
          <CircleX className="h-4 w-4 cursor-pointer  shadow-amber-50 hover:rotate-90 transition-transform duration-200" />
         
        </ItemActions>
      </Item>
     
              ))}
            </div>

            {/* Input */}
            <Input
              className="input-class" /* replace with your Input component if needed */
              type="text"
              placeholder="Type a skill and press comma or Enter or Tab"
              value={inputText}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              aria-label="Add skill"
            />
          </div>
        </FormControl>

        <FormMessage />
      </FormItem>
    );
  }}
/>
            <Button type="submit" className="cursor-pointer" onClick={() => console.log("current values:", form.getValues())}>Submit</Button>
          </form>
        </Form>
      </CardContent>

      
    </Card>
  );
};

export default OnboardingForm;