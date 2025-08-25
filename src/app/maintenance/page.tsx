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
  assetData: z.string().min(10, "Vui lòng cung cấp dữ liệu tài sản chi tiết hơn."),
  inventoryData: z.string().min(10, "Vui lòng cung cấp dữ liệu kiểm kê chi tiết hơn."),
  reportedProblems: z.string().min(10, "Vui lòng cung cấp báo cáo sự cố chi tiết hơn."),
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
      console.error("Lỗi tạo lịch bảo trì:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo lịch bảo trì. Vui lòng thử lại.",
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
          <h1 className="text-3xl font-bold tracking-tight">Bảo trì dự đoán bằng AI</h1>
          <p className="text-muted-foreground">
            Tận dụng AI để dự báo nhu cầu bảo trì và ngăn ngừa thời gian chết.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Dữ liệu đầu vào</CardTitle>
                <CardDescription>
                  Cung cấp dữ liệu cần thiết để AI phân tích.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dữ liệu tài sản</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ví dụ: Lịch sử sử dụng, số liệu hiệu suất, nhật ký bảo trì..."
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
                      <FormLabel>Dữ liệu kiểm kê</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ví dụ: Danh sách tài sản, số lượng, trạng thái hiện tại (đang sử dụng, hỏng)..."
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
                      <FormLabel>Các sự cố đã báo cáo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ví dụ: Hồ sơ các vấn đề đã báo cáo, tần suất, chi tiết giải quyết..."
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
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                     <Sparkles className="mr-2 h-4 w-4" />
                      Tạo lịch trình
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
                 <p className="mt-4 text-muted-foreground">AI đang phân tích dữ liệu. Vui lòng đợi...</p>
              </CardContent>
            </Card>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Lịch trình bảo trì
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
                    Đánh giá rủi ro
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
                    Khuyến nghị
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
