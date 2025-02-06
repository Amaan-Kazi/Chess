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
import { Switch } from "@/components/ui/switch";

const passAndPlaySchema = z.object({
  white: z.string().min(2, {message: "Name must be atleast 2 characters"}).max(50, {message: "Name can be 50 characters at most"}),
  black: z.string().min(2, {message: "Name must be atleast 2 characters"}).max(50, {message: "Name can be 50 characters at most"}),
  flipBoard: z.boolean(),
  flipPiece: z.boolean(),
  allowUndo: z.boolean(),
});

export function PassAndPlayForm() {
  const form = useForm<z.infer<typeof passAndPlaySchema>>({
    resolver: zodResolver(passAndPlaySchema),
    defaultValues: {
      white: "White",
      black: "Black",
      flipBoard: true,
      flipPiece: false,
      allowUndo: true,
    },
  });
 
  function onSubmit(values: z.infer<typeof passAndPlaySchema>) {
    // ✅ type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-center">
        <div className="space-y-4 2xl:space-y-10 h-full w-[95%] 2xl:w-[90%] m-auto">
          <div className="flex w-full justify-between">
            <FormField
              control={form.control}
              name="white"
              render={({ field }) => (
                <FormItem className="w-[47.5%]">
                  <FormLabel>Player 1 [White]</FormLabel>
                  <FormControl>
                    <Input placeholder="White" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="black"
              render={({ field }) => (
                <FormItem className="w-[47.5%]">
                  <FormLabel>Player 2 [Black]</FormLabel>
                  <FormControl>
                    <Input placeholder="Black" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="flipBoard"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Flip Board</FormLabel>
                  <FormDescription>
                    Flip the board on each turn
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="flipPiece"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Flip One Side</FormLabel>
                  <FormDescription>
                    Flip the pieces and UI of one side
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowUndo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Allow Undo</FormLabel>
                  <FormDescription>
                    Allow undoing moves
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button className="w-full text-white" type="submit">Pass and Play</Button>
        </div>
      </form>
    </Form>
  )
}
