function splitByLength(str, length) {
  var resultArr = [];
  if (!str || !length || length < 1) return resultArr;
  var index = 0;
  var start = index;
  var end = start + length;
  while (start < str.length) {
    resultArr[index] = str.substring(start, end);
    index++;
    start = end;
    end = start + length;
  }
  return resultArr;
}

function local_search(data, keyword) {
  for (var key in data) {
    if (Array.isArray(data[key])) {
      if (local_search(data[key], keyword)) {
        return true;
      }
    } else if (data[key] instanceof Object) {
      if (local_search(data[key], keyword)) {
        return true;
      }
    } else {
      if (String(data[key]).indexOf(keyword) != -1) {
        return true;
      }
    }
  }
  return false;
}

//export default function search(data, keyword, hash) {
function search(data, keyword, hash) {
  var flg1 = 1;
  var flg2 = 1;
  if (keyword != null && keyword !== "") {
    if (local_search(data, keyword)) {
      flg1 = 2;
    }
  } else {
    flg1 = 3;
  }

  if (hash != null && hash !== "") {
    if (data["Hashes"] != null) {
      if (data["Hashes"].indexOf(hash) != -1) {
        flg2 = 2;
      }
    }
  } else {
    flg2 = 3;
  }

  if ((flg1 == 2 && flg2 == 2) || (flg1 == 2 && flg2 == 3) || (flg1 == 3 && flg2 == 2)) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  search: search,
  local_search: local_search,
  splitByLength: splitByLength
}

