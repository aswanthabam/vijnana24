import { publicRouter } from "./api";

export const submitAnswer = async (participantId: string, answer: string) : Promise<SubmitResponse | null> => {
    try{
        var res = await publicRouter.post("/api/cq/submit/", {participantId, answer});
        return res.data.data as SubmitResponse;
    }catch(err){
        console.log(err);
        alert("An Error Occured! [E-03]");
        return null;
    }
}

export const initializeParticipant = async (name: string) : Promise<InitializeResponse | null> => {
    try{
        var res = await publicRouter.post("/api/cq/initialize/",{name: name});
        var data = res.data.data as InitializeResponse;
        return data;
    }catch(err){
        console.log(err);
        alert("An Error Occured! [E-01]");
        return null;
    }
};

export const getQuestion = async (participantId: string) : Promise<QuestionResponse | null> => {
    try {
        var res = await publicRouter.get("/api/cq/get-question/?participantId="+participantId);
        var data = res.data.data as QuestionResponse;
        return data;
    }catch(err){
        console.log(err);
        alert("An Error Occured! [E-02]");
        return null;
    }
};


export type QuestionResponse = {
    won: boolean;
    data: Question;
}
export type Question = {
    question: string;
    order: number;
    difficulty: number;
    name: string;
};

export type InitializeResponse = {
    participantId: string;
    current_order: number;
};

export type SubmitResponse = {
    won: boolean;
    correct: boolean;
};