var nodes = [
    {
        "id": 1, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"path\": \"?\", \"image\": \"System\", \"guid\": \"{0079005F-0073-0074-6500-6D0000000000}\", \"pid\": \"4\", \"recode_number\": 33400}", 
        "label": "System", 
        "shape": "circularImage", 
        "title": "?", 
        "url": "sysmon_search_visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
    }, 
    {
        "id": 2, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\smss.exe\", \"pid\": \"236\", \"record_number\": 33400, \"path\": \"\\\\SystemRoot\\\\System32\\\\smss.exe\", \"guid\": \"{B9BDBBFE-7246-5A0A-0000-00105C2D0000}\", \"utc_time\": \"2017-11-14 04:34:14.609\"}", 
        "label": "C:\\Windows\\System32\\smss.exe", 
        "shape": "circularImage", 
        "title": "\\SystemRoot\\System32\\smss.exe", 
        "url": "sysmon_search_visual#/detail.html?pid=236&image=%7BB9BDBBFE-7246-5A0A-0000-00105C2D0000%7D"
    }, 
    {
        "id": 3, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\smss.exe\", \"pid\": \"344\", \"record_number\": 33404, \"path\": \"\\\\SystemRoot\\\\System32\\\\smss.exe 00000001 0000003c \", \"guid\": \"{B9BDBBFE-8D26-5A1F-0000-0010B9580000}\", \"utc_time\": \"2017-11-30 04:46:30.421\"}", 
        "label": "C:\\Windows\\System32\\smss.exe", 
        "shape": "circularImage", 
        "title": "\\SystemRoot\\System32\\smss.exe 00000001 0000003c ", 
        "url": "sysmon_search_visual#/detail.html?pid=344&image=%7BB9BDBBFE-8D26-5A1F-0000-0010B9580000%7D"
    }, 
    {
        "id": 4, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\winlogon.exe\", \"pid\": \"392\", \"record_number\": 33407, \"path\": \"winlogon.exe\", \"guid\": \"{B9BDBBFE-8D27-5A1F-0000-0010325B0000}\", \"utc_time\": \"2017-11-30 04:46:31.640\"}", 
        "label": "C:\\Windows\\System32\\winlogon.exe", 
        "shape": "circularImage", 
        "title": "winlogon.exe", 
        "url": "sysmon_search_visual#/detail.html?pid=392&image=%7BB9BDBBFE-8D27-5A1F-0000-0010325B0000%7D"
    }, 
    {
        "id": 5, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\userinit.exe\", \"pid\": \"2372\", \"record_number\": 33520, \"path\": \"C:\\\\Windows\\\\system32\\\\userinit.exe\", \"guid\": \"{B9BDBBFE-9541-5A1F-0000-00100C010300}\", \"utc_time\": \"2017-11-30 05:21:05.034\"}", 
        "label": "C:\\Windows\\System32\\userinit.exe", 
        "shape": "circularImage", 
        "title": "C:\\Windows\\system32\\userinit.exe", 
        "url": "sysmon_search_visual#/detail.html?pid=2372&image=%7BB9BDBBFE-9541-5A1F-0000-00100C010300%7D"
    }, 
    {
        "id": 6, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\explorer.exe\", \"pid\": \"2404\", \"record_number\": 33521, \"path\": \"C:\\\\Windows\\\\Explorer.EXE\", \"guid\": \"{B9BDBBFE-9541-5A1F-0000-00104C040300}\", \"utc_time\": \"2017-11-30 05:21:05.381\"}", 
        "label": "C:\\Windows\\explorer.exe", 
        "shape": "circularImage", 
        "title": "C:\\Windows\\Explorer.EXE", 
        "url": "sysmon_search_visual#/detail.html?pid=2404&image=%7BB9BDBBFE-9541-5A1F-0000-00104C040300%7D"
    }, 
    {
        "id": 7, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Users\\\\chiyoda\\\\Desktop\\\\download\\\\Ursnif_malware.exe\", \"pid\": \"3332\", \"record_number\": 33528, \"path\": \"\\\"C:\\\\Users\\\\chiyoda\\\\Desktop\\\\download\\\\Ursnif_malware.exe\\\" \", \"guid\": \"{B9BDBBFE-9565-5A1F-0000-001013360400}\", \"utc_time\": \"2017-11-30 05:21:41.404\"}", 
        "label": "C:\\Users\\chiyoda\\Desktop\\download\\Ursnif_malware.exe", 
        "shape": "circularImage", 
        "title": "\"C:\\Users\\chiyoda\\Desktop\\download\\Ursnif_malware.exe\" ", 
        "url": "sysmon_search_visual#/detail.html?pid=3332&image=%7BB9BDBBFE-9565-5A1F-0000-001013360400%7D"
    }, 
    {
        "id": 8, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\cmd.exe\", \"pid\": \"3520\", \"record_number\": 33534, \"path\": \"cmd /c \\\"\\\"C:\\\\Users\\\\chiyoda\\\\AppData\\\\Local\\\\Temp\\\\6C56\\\\B756.bat\\\" \\\"C:\\\\Users\\\\chiyoda\\\\AppData\\\\Roaming\\\\MICROS~1\\\\Cewmcatq\\\\BWCohlEx.exe\\\" \\\"C:\\\\Users\\\\chiyoda\\\\Desktop\\\\download\\\\URSNIF~1.EXE\\\"\\\"\", \"guid\": \"{B9BDBBFE-9570-5A1F-0000-00104D7F0400}\", \"utc_time\": \"2017-11-30 05:21:52.244\"}", 
        "label": "C:\\Windows\\System32\\cmd.exe", 
        "shape": "circularImage", 
        "title": "cmd /c \"\"C:\\Users\\chiyoda\\AppData\\Local\\Temp\\6C56\\B756.bat\" \"C:\\Users\\chiyoda\\AppData\\Roaming\\MICROS~1\\Cewmcatq\\BWCohlEx.exe\" \"C:\\Users\\chiyoda\\Desktop\\download\\URSNIF~1.EXE\"\"", 
        "url": "sysmon_search_visual#/detail.html?pid=3520&image=%7BB9BDBBFE-9570-5A1F-0000-00104D7F0400%7D"
    }, 
    {
        "id": 9, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Windows\\\\System32\\\\cmd.exe\", \"pid\": \"3548\", \"record_number\": 33536, \"path\": \"cmd  /C \\\"\\\"C:\\\\Users\\\\chiyoda\\\\AppData\\\\Roaming\\\\MICROS~1\\\\Cewmcatq\\\\BWCohlEx.exe\\\" \\\"C:\\\\Users\\\\chiyoda\\\\Desktop\\\\download\\\\URSNIF~1.EXE\\\"\\\"\", \"guid\": \"{B9BDBBFE-9570-5A1F-0000-00106B860400}\", \"utc_time\": \"2017-11-30 05:21:52.775\"}", 
        "label": "C:\\Windows\\System32\\cmd.exe", 
        "shape": "circularImage", 
        "title": "cmd  /C \"\"C:\\Users\\chiyoda\\AppData\\Roaming\\MICROS~1\\Cewmcatq\\BWCohlEx.exe\" \"C:\\Users\\chiyoda\\Desktop\\download\\URSNIF~1.EXE\"\"", 
        "url": "sysmon_search_visual#/detail.html?pid=3548&image=%7BB9BDBBFE-9570-5A1F-0000-00106B860400%7D"
    }, 
    {
        "id": 10, 
        "image": "../plugins/sysmon_search_visual/program.png", 
        "info": "{\"image\": \"C:\\\\Users\\\\chiyoda\\\\AppData\\\\Roaming\\\\MICROS~1\\\\Cewmcatq\\\\BWCohlEx.exe\", \"pid\": \"3556\", \"record_number\": 33537, \"path\": \"\\\"C:\\\\Users\\\\chiyoda\\\\AppData\\\\Roaming\\\\MICROS~1\\\\Cewmcatq\\\\BWCohlEx.exe\\\"  \\\"C:\\\\Users\\\\chiyoda\\\\Desktop\\\\download\\\\URSNIF~1.EXE\\\"\", \"guid\": \"{B9BDBBFE-9570-5A1F-0000-001037870400}\", \"utc_time\": \"2017-11-30 05:21:52.820\"}", 
        "label": "C:\\Users\\chiyoda\\AppData\\Roaming\\MICROS~1\\Cewmcatq\\BWCohlEx.exe", 
        "shape": "circularImage", 
        "title": "\"C:\\Users\\chiyoda\\AppData\\Roaming\\MICROS~1\\Cewmcatq\\BWCohlEx.exe\"  \"C:\\Users\\chiyoda\\Desktop\\download\\URSNIF~1.EXE\"", 
        "url": "sysmon_search_visual#/detail.html?pid=3556&image=%7BB9BDBBFE-9570-5A1F-0000-001037870400%7D"
    }
];
exports.nodes = nodes;
