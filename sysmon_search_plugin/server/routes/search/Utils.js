var Utils = {
    eventid_to_type: function(event_id) {
        var result = "";
        switch (event_id) {
            case 1:
                result = "create_process";
                break;
            case 11:
                result = "create_file";
                break;
            case 12:
            case 13:
            case 14:
                result = "registry";
                break;
            case 3:
                result = "net_access";
                break;
            case 8:
                result = "remote_thread";
                break;
            case 2:
                result = "file_create_time";
                break;
            case 7:
                result = "image_loaded";
                break;
            case 19:
            case 20:
            case 21:
                result = "wmi";
                break;

            case 22:
                result = "dns";
                break;
            //case 5:
            //    result = "process_terminated";
            //    break;

            default:
                result = "other";
            break;
        }

        return result;
    },
    get_range_datetime: function(date) {
        var date_str = date.substr(0, 10)+"T"+date.substr(11, 12)+"Z";
        var base_date = new Date(date_str);
        var start_date = new Date(base_date.getTime());
        var end_date = new Date(base_date.getTime());
        //start_date.setHours(start_date.getHours() - Number(config.refine_time_range));
        //end_date.setHours(end_date.getHours() + Number(config.refine_time_range));
        start_date.setHours(start_date.getHours() - 1);
        end_date.setHours(end_date.getHours() + 1);
        var start_date_str = this.date_to_text(start_date);
        var end_date_str = this.date_to_text(end_date);

        return {"start_date": start_date_str, "end_date": end_date_str};
    },
    get_range_datetime2: function(date, start_time, end_time) {
        //var date_str = date.substr(0, 10)+"T"+date.substr(11, 12)+"Z";
        //var base_date = new Date(date_str);
        var base_date = new Date(date);
        var start_date = new Date(base_date.getTime());
        var end_date = new Date(base_date.getTime());

        var start_time_array = start_time.split(':');
        var ent_time_array = end_time.split(':');

        start_date.setUTCHours(parseInt(start_time_array[0]),parseInt(start_time_array[1]));
        end_date.setUTCHours(parseInt(ent_time_array[0]),parseInt(ent_time_array[1]),59);

        var start_date_str = this.date_to_text(start_date);
        var end_date_str = this.date_to_text(end_date);

        return {"start_date": start_date_str, "end_date": end_date_str};
    },
    get_range_datetime3: function(start_time, end_time) {
        var start_date = new Date();
        var end_date = new Date();

        start_date.setTime( start_time );
        end_date.setTime( end_time );

        var start_date_str = this.date_to_text(start_date);
        var end_date_str = this.date_to_text(end_date);

        return {"start_date": start_date_str, "end_date": end_date_str};
    },
    date_to_text: function(date) {
        var y = this.padding(date.getUTCFullYear(), 4, "0"),
            m = this.padding(date.getUTCMonth()+1, 2, "0"),
            d = this.padding(date.getUTCDate(), 2, "0"),
            h = this.padding(date.getUTCHours(), 2, "0"),
            min = this.padding(date.getUTCMinutes(), 2, "0"),
            s = this.padding(date.getUTCSeconds(), 2, "0"),
            millsec = this.padding(date.getUTCMilliseconds(), 3, "0");

        return [y, m, d].join('-') + 'T' + [h, min, s].join(':') + 'Z';
    },
    padding: function(n, d, p) {
        p = p || '0';
        return (p.repeat(d) + n).slice(-d);
    }
}

module["exports"] = Utils;
