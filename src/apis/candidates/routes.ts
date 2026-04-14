import { backendApi } from "@/lib/backendApi";

export const candidateApi = {

    async getCandidates() {
        const res = await backendApi.get("/api/candidate/profiles/");
        return res.data;
    },

    //  async sendResume(data: any) {
    //     const res = await backendApi.post("/api/referrals/resume/parse/", data);
    //     return res.data;
    // },
  
  };
