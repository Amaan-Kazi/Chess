"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const passAndPlaySchema = z.object({
  name1: z.string().min(2, {message: "Name must be atleast 2 characters"}).max(50, {message: "Name can be 50 characters at most"}),
  name2: z.string().min(2, {message: "Name must be atleast 2 characters"}).max(50, {message: "Name can be 50 characters at most"}),
});

export function PassAndPlayForm() {
  const form = useForm<z.infer<typeof passAndPlaySchema>>({
    resolver: zodResolver(passAndPlaySchema),
    defaultValues: {
      name1: "",
      name2: "",
    },
  });
 
  function onSubmit(values: z.infer<typeof passAndPlaySchema>) {
    // ✅ type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
