import { MongoDBDefault } from "./MongoDBDefault";
import { Resource } from "./Resource";
import { Student } from "./Student";

export type ResourceType = "test" | "assignment" | "exam";

export type Category = MongoDBDefault & {
  id: string;
  courseId: string;
  name: string;
  type: ResourceType;
  maxScoreAttainable: number;
  resources?: Resource[];
  students?: Student[];
};
