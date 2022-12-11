// dashboard update
let updateBool = false;
var updateTimeout;
if ($(".dashboard-container").length != 0)
  updateTimeout = setTimeout(updateCall, 60000);
function updateCall() {
  clearTimeout(updateTimeout);

  let today = new Date();
  let hour = today.getHours();
  let minutes = today.getMinutes();

  startBtn();

  // 1분후 업데이트 다시 실행
  updateTimeout = setTimeout(updateCall, 60000);

  // 5분 단위의 시간대가 아닐 시 업데이트가 안되도록 return
  if (minutes != 0 && minutes % 5 != 0) {
    updateBool = false;
    return;
  }

  // 5분 단위의 시간인지 확인하기
  if ((minutes == 0 || minutes % 5 == 0) && !updateBool) {
    hour = hour < 10 ? `0${hour}` : hour;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    // api 호출
    $.ajax({
      url: `http://${ip}:${port}${AHU_TEMP}`,
      method: "GET",
      dataType: "json",
      data: { runDate: `20100111${hour}${minutes}` },
    })
      .done((data) => {
        // 데이터 정리
        const convertData = {};
        data.forEach(function (key) {
          switch (key.machine_num) {
            case "1":
              convertData.ahu01_sat = key.ahu_sat;
              convertData.ahu01_out = key.ahu_out;
              convertData.ahu01_mat = key.ahu_mat;
              convertData.ahu01_rat = key.ahu_rat;
              break;
            case "2":
              convertData.ahu02_sat = key.ahu_sat;
              convertData.ahu02_out = key.ahu_out;
              convertData.ahu02_mat = key.ahu_mat;
              convertData.ahu02_rat = key.ahu_rat;
              break;
            case "3":
              convertData.ahu03_sat = key.ahu_sat;
              convertData.ahu03_out = key.ahu_out;
              convertData.ahu03_mat = key.ahu_mat;
              convertData.ahu03_rat = key.ahu_rat;
              break;
            case "4":
              convertData.ahu04_sat = key.ahu_sat;
              convertData.ahu04_out = key.ahu_out;
              convertData.ahu04_mat = key.ahu_mat;
              convertData.ahu04_rat = key.ahu_rat;
              break;
            case "5":
              convertData.ahu05_sat = key.ahu_sat;
              convertData.ahu05_out = key.ahu_out;
              convertData.ahu05_mat = key.ahu_mat;
              convertData.ahu05_rat = key.ahu_rat;
              break;
            case "6":
              convertData.ahu06_sat = key.ahu_sat;
              convertData.ahu06_out = key.ahu_out;
              convertData.ahu06_mat = key.ahu_mat;
              convertData.ahu06_rat = key.ahu_rat;
              break;
            case "7":
              convertData.ahu07_sat = key.ahu_sat;
              convertData.ahu07_out = key.ahu_out;
              convertData.ahu07_mat = key.ahu_mat;
              convertData.ahu07_rat = key.ahu_rat;
              break;
            case "8":
              convertData.ahu08_sat = key.ahu_sat;
              convertData.ahu08_out = key.ahu_out;
              convertData.ahu08_mat = key.ahu_mat;
              convertData.ahu08_rat = key.ahu_rat;
              break;
            default:
              break;
          }
        });

        update(convertData);

        // 최종 업데이트 시간 표시
        var updateYear = today.getFullYear();
        var updateMonth = today.getMonth() + 1;
        updateMonth = updateMonth < 10 ? `0${updateMonth}` : updateMonth;
        var updateDay = today.getDate();
        updateDay = updateDay < 10 ? `0${updateDay}` : updateDay;
        $(".update_time").text(
          jsonDateParse(
            `${updateYear}${updateMonth}${updateDay}${hour}${minutes}`,
            "dashboard"
          )
        );

        /* 경고창으로 업데이트 알려주기 */
        Notification.requestPermission(function (result) {
          if (result == "granted" && windowBlur) {
            // 알림 전송
            var notification = new Notification("대시보드", {
              body:
                jsonDateParse(
                  `${updateYear}${updateMonth}${updateDay}${hour}${minutes}`,
                  "dashboard"
                ) + " 데이터베이스 업데이트",
              icon:
                location.protocol +
                "//" +
                location.host +
                "/static/images/bell.png",
            });

            notification.onclick = function () {
              parent.focus();
              window.focus(); // 업데이트 알림창 클릭시 브라우저창이 활성화 될 수 있도록 함
            };

            // 알림 닫기
            setTimeout(function () {
              notification.close();
            }, 5000);
          } else {
            // 현재 FEMS 페이지가 활성화 중이라면 간단한 창으로 알림을 띄움
            toastr.info(
              jsonDateParse(
                `${updateYear}${updateMonth}${updateDay}${hour}${minutes}`,
                "dashboard"
              ) + "데이터 업데이트",
              "대시보드"
            );
          }
        });
      })
      .fail((err) => {
        console.log(err);
      });
  }

  return;
}

// 페이지에 처음 진입 했을 때, 업데이트가 될 수 있도록 실행
function firstUpdateCall() {
  let today = new Date();
  let hour = today.getHours();
  hour = hour < 10 ? `0${hour}` : hour;
  let minutes = today.getMinutes();

  if (minutes % 5 == 0) updateBool = true;

  // 대시보드를 호출할 때 현재시간과 제일 가까운 5분데이터 값 호출
  let timeList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  let target = minutes;
  let near = 0;
  let abs = 0;
  var min = 59;

  for (var i = 0; i < timeList.length; i++) {
    abs =
      timeList[i] - target < 0 ? -(timeList[i] - target) : timeList[i] - target;

    if (abs < min) {
      min = abs;
      near = timeList[i];

      if (minutes < timeList[i]) near = timeList[i - 1];
    }
  }

  near = near < 10 ? `0${near}` : near;

  startBtn();

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${AHU_TEMP}`,
    method: "GET",
    dataType: "json",
    data: { runDate: `20100111${hour}${near}00` },
  })
    .done((data) => {
      // 데이터 정리
      const convertData = {};
      data.map(function (key) {
        switch (key.machine_num) {
          case "1":
            convertData.ahu01_sat = key.ahu_sat;
            convertData.ahu01_out = key.ahu_out;
            convertData.ahu01_mat = key.ahu_mat;
            convertData.ahu01_rat = key.ahu_rat;
            break;
          case "2":
            convertData.ahu02_sat = key.ahu_sat;
            convertData.ahu02_out = key.ahu_out;
            convertData.ahu02_mat = key.ahu_mat;
            convertData.ahu02_rat = key.ahu_rat;
            break;
          case "3":
            convertData.ahu03_sat = key.ahu_sat;
            convertData.ahu03_out = key.ahu_out;
            convertData.ahu03_mat = key.ahu_mat;
            convertData.ahu03_rat = key.ahu_rat;
            break;
          case "4":
            convertData.ahu04_sat = key.ahu_sat;
            convertData.ahu04_out = key.ahu_out;
            convertData.ahu04_mat = key.ahu_mat;
            convertData.ahu04_rat = key.ahu_rat;
            break;
          case "5":
            convertData.ahu05_sat = key.ahu_sat;
            convertData.ahu05_out = key.ahu_out;
            convertData.ahu05_mat = key.ahu_mat;
            convertData.ahu05_rat = key.ahu_rat;
            break;
          case "6":
            convertData.ahu06_sat = key.ahu_sat;
            convertData.ahu06_out = key.ahu_out;
            convertData.ahu06_mat = key.ahu_mat;
            convertData.ahu06_rat = key.ahu_rat;
            break;
          case "7":
            convertData.ahu07_sat = key.ahu_sat;
            convertData.ahu07_out = key.ahu_out;
            convertData.ahu07_mat = key.ahu_mat;
            convertData.ahu07_rat = key.ahu_rat;
            break;
          case "8":
            convertData.ahu08_sat = key.ahu_sat;
            convertData.ahu08_out = key.ahu_out;
            convertData.ahu08_mat = key.ahu_mat;
            convertData.ahu08_rat = key.ahu_rat;
            break;
          default:
            break;
        }
      });

      update(convertData);

      // 업데이트 시간 출력
      var updateYear = today.getFullYear();
      var updateMonth = today.getMonth() + 1;
      updateMonth = updateMonth < 10 ? `0${updateMonth}` : updateMonth;
      var updateDay = today.getDate();
      updateDay = updateDay < 10 ? `0${updateDay}` : updateDay;
      $(".update_time").text(
        jsonDateParse(
          `${updateYear}${updateMonth}${updateDay}${hour}${near}`,
          "dashboard"
        )
      );
    })
    .fail((err) => {
      console.log(err);
    });
}

function ahuConfigurationCall() {
  $.ajax({
    url: `http://${ip}:${port}${ahuConfiguration}`,
    method: "GET",
    dataType: "json",
  })
    .done((data) => {
      ahuInfos(data);
    })
    .fail((err) => {
      console.log(err);
    });
}

// // ahu 설비 정보
// function ahuInfoCall() {
//   // api 호출
//   $.ajax({
//     url: `http://${ip}:${port}${ahuInfoAddress}`,
//     method: "GET",
//     dataType: "json",
//     data: { FAC_NAME: $("#fac_name option:selected").text().toUpperCase() },
//   })
//     .done((data) => {
//       ahuInfo(data);
//     })
//     .fail((err) => {
//       console.log(err);
//     });
// }

// ahu 온도 호출
function ahuTempCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#temp_date").val() == "") {
    toastr.warning("조회일자를 선택해주세요", "error");
    return;
  }

  var dateConvert = jsonFormDateParse($("#temp_date").val());

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${AHU_TEMP}`,
    method: "GET",
    dataType: "json",
    data: {
      machine_num: $("#fac_name").val(),
      startDate: dateConvert,
      endDate: dateConvert,
    },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".temp_form button").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDateTime = jsonDateParse(String(e.runDateTime), "temp");
      });

      ahuChart(json);
      ahuTable(json);

      $(".temp_form button").removeAttr("disabled");
    })
    .fail((err) => {
      console.log(err);
    });
}

// 시간별 전력 데이터 호출
function hourPowerCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#lpDate").val() == "") {
    toastr.warning("조회일자를 선택해주세요", "error");
    return;
  }

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${AHU_TOTAL_POEWR}`,
    method: "GET",
    dataType: "json",
    data: { runDate: jsonFormDateParse($("#lpDate").val()) },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".power_search").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDate = jsonDateParse(String(e.runDate), "hour");
      });

      hourChart(json);
      hourTable(json);

      $(".power_search").removeAttr("disabled");
    })

    .fail((err) => {
      console.log(err);
    });
}

function dayPowerCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#lpDate").val() == "") {
    toastr.warning("조회 월을 선택해주세요", "error");
    return;
  }

  var nextMonth = new Date($("#lpDate").val() + "-01");
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  var nextMonthValue = nextMonth.getMonth() + 1;
  nextMonthValue = nextMonthValue < 10 ? "0" + nextMonthValue : nextMonthValue;

  var endDateValue = nextMonth.getFullYear() + String(nextMonthValue);
  var dateConvert = jsonFormDateParse($("#lpDate").val());

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${AHU_DAILY_POWER}`,
    method: "GET",
    dataType: "json",
    data: { startDate: dateConvert, endDate: endDateValue },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".power_search").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDate = jsonDateParse(e.runDate, "day");
      });

      dayChart(json);
      dayTable(json);

      $(".power_search").removeAttr("disabled");
    })
    .fail((err) => {
      console.log(err);
    });
}

// chiler 환수온도 호출
function chilerTempCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#temp_date").val() == "") {
    toastr.warning("조회일자를 선택해주세요", "error");
    return;
  }

  var dateConvert = jsonFormDateParse($("#temp_date").val());

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${CHILER_POWER}`,
    method: "GET",
    dataType: "json",
    data: {
      machine_num: $("#fac_name").val(),
      startDate: dateConvert,
      endDate: dateConvert,
    },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".temp_form button").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDateTime = jsonDateParse(String(e.runDateTime), "temp");
      });

      chilerChart(json);
      chilerTable(json);

      $(".temp_form button").removeAttr("disabled");
    })
    .fail((err) => {
      console.log(err);
    });
}

// boiler 전력 호출
function boilerTempCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#temp_date").val() == "") {
    toastr.warning("조회일자를 선택해주세요", "error");
    return;
  }

  var dateConvert = jsonFormDateParse($("#temp_date").val());

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${BOILER_POWER}`,
    method: "GET",
    dataType: "json",
    data: {
      machine_num: $("#fac_name").val(),
      startDate: dateConvert,
      endDate: dateConvert,
    },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".temp_form button").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDateTime = jsonDateParse(String(e.runDateTime), "temp");
      });

      boilerChart(json);
      boilerTable(json);

      $(".temp_form button").removeAttr("disabled");
    })
    .fail((err) => {
      console.log(err);
    });
}

// boiler 가스 호출
function boilerGasCall() {
  // 날짜 선택하지 않았을 시, 선택하라는 메시지 띄우기
  if ($("#temp_date").val() == "") {
    toastr.warning("조회일자를 선택해주세요", "error");
    return;
  }

  var dateConvert = jsonFormDateParse($("#temp_date").val());

  // api 호출
  $.ajax({
    url: `http://${ip}:${port}${BOILER_GAS}`,
    method: "GET",
    dataType: "json",
    data: {
      machine_num: $("#fac_name").val(),
      startDate: dateConvert,
      endDate: dateConvert,
    },
  })
    .done((data) => {
      // 호출 동안 검색 버튼이 비활성화 되도록 막기
      $(".temp_form button").attr("disabled", "true");

      var json = data;
      json.forEach((e) => {
        e.runDateTime = jsonDateParse(String(e.runDateTime), "temp");
      });

      boilerGasChart(json);
      boilerGasTable(json);

      $(".temp_form button").removeAttr("disabled");
    })
    .fail((err) => {
      console.log(err);
    });
}