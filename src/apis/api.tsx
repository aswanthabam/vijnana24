import axios from "axios";
import { _EventInfo } from "../types";
import { baseURL } from "../config";
import { useLoader } from "../components/toploader/useLoader";

export const publicRouter = axios.create({ baseURL: baseURL });

interface EventInfoData {
  event_id: string;
  name: string;
  description: string;
  link: string;
  img: string;
  details: string;
  documents: string;
  date: Date;
  venue: string;
  poster: string;
  is_open: boolean;
}

export const getEvents = async (
  eventId: string | null | undefined,
  setLoading: (status: boolean) => void
) => {
  setLoading(true);
  if (eventId) {
    var res = await publicRouter.get("/api/v2/events/?event_id=" + eventId);
  } else {
    var res = await publicRouter.get("/api/v2/events/");
  }
  var d2: _EventInfo[] = [];
  if (res.data["status"]) {
    if (res.data["data"] != undefined && res.data["data"] != null) {
      var data: EventInfoData[] = res.data["data"] as EventInfoData[];
      //   console.log(data);
      for (var i = 0; i < data.length; i++) {
        var data2 = data[0];
        var date: Date = new Date(data2!["date"]);
        const dateString = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }); // Output: Dec 25, 2023
        const timeString = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }); // Output: 10:11 PM

        d2!.push({
          id: data2!["event_id"],
          name: data2!["name"],
          img: data2!["img"],
          link: data2!["link"],
          description: data2!["description"],
          time: timeString,
          details: data2!["details"],
          documents: data2!["documents"],
          date: dateString,
          is_open: data2!["is_open"],
          poster: data2!["poster"],
          venue: data2!["venue"],
        });
      }
    } else {
      alert(res.data["message"]);
    }
  }
  setLoading(false);
  return d2!;
};
