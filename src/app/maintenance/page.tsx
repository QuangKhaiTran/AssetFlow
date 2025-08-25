"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getPredictiveMaintenanceSchedule,
  type PredictiveMaintenanceScheduleInput,
  type PredictiveMaintenanceScheduleOutput,
} from "@/ai/flows/predictive-maintenance-schedules";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, FileText, ShieldAlert, Wrench, Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  assetData: z.string().min(10, "Please provide more detailed asset data."),
  inventoryData: z.string().min(10, "Please provide more detailed inventory data."),
  reportedProblems: z.string().min(10, "Please provide more detailed problem reports."),
});

export default function PredictiveMaintenancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictiveMaintenanceScheduleOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<PredictiveMaintenanceScheduleInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetData: "",
      inventoryData: "",
      reportedProblems: "",
    },
  });

  const onSubmit: SubmitHandler<PredictiveMaintenanceScheduleInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const schedule = await getPredictiveMaintenanceSchedule(data);
      setResult(schedule);
    } catch (error) {
      console.error("Error generating maintenance schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate the maintenance schedule. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Predictive Maintenance</h1>
          <p className="text-muted-foreground">
            Leverage AI to forecast maintenance needs and prevent downtime.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Input Data</CardTitle>
                <CardDescription>
                  Provide the necessary data for the AI to analyze.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Historical usage, performance metrics, maintenance logs..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventoryData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Asset list, quantities, current status (in use, broken)..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportedProblems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported Problems</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Records of reported issues, frequency, resolution details..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                     <Sparkles className="mr-2 h-4 w-4" />
                      Generate Schedule
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-8">
          {isLoading && (
            <Card className="flex flex-col items-center justify-center h-full">
              <CardContent className="text-center">
                 <Loader2 className="h-16 w-16 animate-spin text-primary" />
                 <p className="mt-4 text-muted-foreground">AI is analyzing the data. Please wait...</p>
              </CardContent>
            </Card>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {result.maintenanceSchedule}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {result.riskAssessment}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {result.recommendations}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
