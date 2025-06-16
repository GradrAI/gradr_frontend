export interface StudentData {
  studentId?: string;
  _id?: string;
}

export interface ResultDataItem {
  student: string | StudentData;
  fileUrl: string;
  resourceId: string;
  result?: any;
}

export interface CourseData {
  maxScoreAttainable?: number;
  guide?: string;
  question?: string;
}

export interface GradingPayload {
  resultData: ResultDataItem[];
  courseData: CourseData;
}

export const normalizeGradingPayload = (
  resultData: ResultDataItem[],
  courseData: CourseData = {}
): GradingPayload => {
  const normalizedResultData = resultData.map((item) => ({
    ...item,
    student:
      typeof item.student === "string"
        ? {
            studentId: item.student,
            _id: item.student,
          }
        : {
            studentId: item.student?.studentId || item.student?._id,
            _id: item.student?._id || item.student?.studentId,
          },
    result: item.result || null,
  }));

  return {
    resultData: normalizedResultData,
    courseData,
  };
};
