'use server';

/**
 * @fileOverview An AI agent that analyzes asset data and predicts maintenance needs.
 *
 * - getPredictiveMaintenanceSchedule - A function that generates a predictive maintenance schedule based on asset data.
 * - PredictiveMaintenanceScheduleInput - The input type for the getPredictiveMaintenanceSchedule function.
 * - PredictiveMaintenanceScheduleOutput - The return type for the getPredictiveMaintenanceSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveMaintenanceScheduleInputSchema = z.object({
  assetData: z
    .string()
    .describe(
      'Một bộ dữ liệu toàn diện chứa thông tin lịch sử tài sản, bao gồm thống kê sử dụng, nhật ký bảo trì và các sự cố được báo cáo.'
    ),
  inventoryData: z
    .string()
    .describe(
      'Dữ liệu kiểm kê chi tiết, liệt kê tất cả tài sản, số lượng và trạng thái hiện tại (ví dụ: đang sử dụng, đang sửa chữa, bị hỏng, đã thanh lý).'
    ),
  reportedProblems: z
    .string()
    .describe(
      'Hồ sơ về tất cả các sự cố được báo cáo liên quan đến tài sản, bao gồm mô tả, tần suất và chi tiết giải quyết.'
    ),
});
export type PredictiveMaintenanceScheduleInput = z.infer<
  typeof PredictiveMaintenanceScheduleInputSchema
>;

const PredictiveMaintenanceScheduleOutputSchema = z.object({
  maintenanceSchedule: z
    .string()
    .describe(
      'Một lịch trình bảo trì chi tiết phác thảo các công việc bảo trì chủ động cho mỗi tài sản, bao gồm tần suất, quy trình và mức độ ưu tiên dựa trên nhu cầu dự đoán.'
    ),
  riskAssessment: z
    .string()
    .describe(
      'Đánh giá các rủi ro tiềm ẩn liên quan đến từng tài sản, bao gồm khả năng hỏng hóc và tác động tiềm tàng đến hoạt động nếu không được bảo trì.'
    ),
  recommendations: z
    .string()
    .describe(
      'Các khuyến nghị cụ thể để tối ưu hóa chiến lược bảo trì, bao gồm các thay đổi được đề xuất về khoảng thời gian bảo trì, quy trình hoặc phân bổ nguồn lực.'
    ),
});
export type PredictiveMaintenanceScheduleOutput = z.infer<
  typeof PredictiveMaintenanceScheduleOutputSchema
>;

export async function getPredictiveMaintenanceSchedule(
  input: PredictiveMaintenanceScheduleInput
): Promise<PredictiveMaintenanceScheduleOutput> {
  return predictiveMaintenanceScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveMaintenanceSchedulePrompt',
  input: {schema: PredictiveMaintenanceScheduleInputSchema},
  output: {schema: PredictiveMaintenanceScheduleOutputSchema},
  prompt: `Bạn là một trợ lý AI được thiết kế để phân tích dữ liệu tài sản và tạo lịch bảo trì dự đoán. Ngôn ngữ phản hồi phải là tiếng Việt.

  Dựa trên dữ liệu tài sản, dữ liệu kiểm kê và các sự cố được báo cáo, mục tiêu của bạn là chủ động xác định các nhu cầu bảo trì tiềm năng, giảm thiểu thời gian chết và tối ưu hóa các chiến lược bảo trì.

  Xem xét các yếu tố sau khi tạo lịch bảo trì:
  - Lịch sử sử dụng và hiệu suất của tài sản
  - Tần suất và mức độ nghiêm trọng của các sự cố được báo cáo
  - Tình trạng và tính sẵn có của tài sản hiện tại
  - Rủi ro tiềm ẩn liên quan đến hỏng hóc tài sản

  Dữ liệu tài sản: {{{assetData}}}
  Dữ liệu kiểm kê: {{{inventoryData}}}
  Các sự cố đã báo cáo: {{{reportedProblems}}}

  Xuất ra lịch bảo trì dự đoán, đánh giá rủi ro và các khuyến nghị ở định dạng rõ ràng và súc tích.
  Bao gồm các nhiệm vụ bảo trì cụ thể, tần suất, mức độ ưu tiên và tác động tiềm tàng đến hoạt động.
  Hãy cụ thể, chuyên nghiệp và có thể hành động với phân tích của bạn.
  Đừng nói chuyện.
  Tuân thủ nghiêm ngặt lược đồ đầu ra.`,
});

const predictiveMaintenanceScheduleFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceScheduleFlow',
    inputSchema: PredictiveMaintenanceScheduleInputSchema,
    outputSchema: PredictiveMaintenanceScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
