import {Filter} from "./consts";
import {Session} from "koishi";

export function defaultFilter(filter:Filter,session:Session){
    switch (filter.type) {
        case "user":{
            for(const user of filter.data){
                if (session.uid === user) return true;
            }
            return false;
        }
        case "flag":{
            for(const ret of filter.data){
                if (session.content?.match(RegExp(`.*[${ret}].*`))) return true;
            }
            return false;
        }
    }
}