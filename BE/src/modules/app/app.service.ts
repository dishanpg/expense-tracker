import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): { status: string; timestamp: string } {
    return {
      status: "server is running 🚀",
      timestamp: new Date().toISOString(),
    };
  }
}
