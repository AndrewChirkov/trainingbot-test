import { Mark, TrainerRole } from "./constants"

export class Helpers {
  static getDayOfWeek = (day, ctx) => {
    const names = {
      sun: ctx.i18n.t("sunday"),
      mon: ctx.i18n.t("monday"),
      tue: ctx.i18n.t("tuesday"),
      wed: ctx.i18n.t("wednesday"),
      thu: ctx.i18n.t("thursday"),
      fri: ctx.i18n.t("friday"),
      sat: ctx.i18n.t("saturday"),
    }

    switch (day) {
      case 0:
        return names.sun
      case 1:
        return names.mon
      case 2:
        return names.tue
      case 3:
        return names.wed
      case 4:
        return names.thu
      case 5:
        return names.fri
      case 6:
        return names.sat
    }
  }

  static getDayOfShorts = (day, ctx) => {
    const names = {
      sun: ctx.i18n.t("shortSun"),
      mon: ctx.i18n.t("shortMon"),
      tue: ctx.i18n.t("shortTue"),
      wed: ctx.i18n.t("shortWed"),
      thu: ctx.i18n.t("shortThu"),
      fri: ctx.i18n.t("shortFri"),
      sat: ctx.i18n.t("shortSat"),
    }

    switch (day) {
      case 0:
        return names.sun
      case 1:
        return names.mon
      case 2:
        return names.tue
      case 3:
        return names.wed
      case 4:
        return names.thu
      case 5:
        return names.fri
      case 6:
        return names.sat
    }
  }

  static getMonthName = (month, ctx) => {
    const names = {
      jan: ctx.i18n.t("jan"),
      feb: ctx.i18n.t("feb"),
      mar: ctx.i18n.t("mar"),
      apr: ctx.i18n.t("apr"),
      may: ctx.i18n.t("may"),
      jun: ctx.i18n.t("jun"),
      jul: ctx.i18n.t("jul"),
      aug: ctx.i18n.t("aug"),
      sep: ctx.i18n.t("sep"),
      oct: ctx.i18n.t("oct"),
      nov: ctx.i18n.t("nov"),
      dec: ctx.i18n.t("dec"),
    }

    switch (month) {
      case 1:
        return names.jan
      case 2:
        return names.feb
      case 3:
        return names.mar
      case 4:
        return names.apr
      case 5:
        return names.may
      case 6:
        return names.jun
      case 7:
        return names.jul
      case 8:
        return names.aug
      case 9:
        return names.sep
      case 10:
        return names.oct
      case 11:
        return names.nov
      case 12:
        return names.dec
    }
  }

  static getMonthNumber = (month, ctx) => {
    const names = {
      jan: ctx.i18n.t("jan"),
      feb: ctx.i18n.t("feb"),
      mar: ctx.i18n.t("mar"),
      apr: ctx.i18n.t("apr"),
      may: ctx.i18n.t("may"),
      jun: ctx.i18n.t("jun"),
      jul: ctx.i18n.t("jul"),
      aug: ctx.i18n.t("aug"),
      sep: ctx.i18n.t("sep"),
      oct: ctx.i18n.t("oct"),
      nov: ctx.i18n.t("nov"),
      dec: ctx.i18n.t("dec"),
    }

    switch (month) {
      case names.jan:
        return 1
      case names.feb:
        return 2
      case names.mar:
        return 3
      case names.apr:
        return 4
      case names.may:
        return 5
      case names.jun:
        return 6
      case names.jul:
        return 7
      case names.aug:
        return 8
      case names.sep:
        return 9
      case names.oct:
        return 10
      case names.nov:
        return 11
      case names.dec:
        return 12
    }
  }

  static checkRole(role) {
    if (role === TrainerRole.Main) return true
    else if (role === TrainerRole.ReadOnly) return false
  }

  static emojiTimes(time) {
    const fixTimes = time.split(":")
    const hour = Number(fixTimes[0])
    const min = Number(fixTimes[1])

    if (hour == 8 && min == 0) return "🕗"
    else if (hour == 8 && min == 30) return "🕣"
    else if (hour == 9 && min == 0) return "🕘"
    else if (hour == 9 && min == 30) return "🕤"
    else if (hour == 10 && min == 0) return "🕙"
    else if (hour == 10 && min == 30) return "🕥"
    else if (hour == 11 && min == 0) return "🕚"
    else if (hour == 11 && min == 30) return "🕦"
    else if (hour == 12 && min == 0) return "🕛"
    else if (hour == 12 && min == 30) return "🕧"
    else if (hour == 13 && min == 0) return "🕐"
    else if (hour == 13 && min == 30) return "🕜"
    else if (hour == 14 && min == 0) return "🕑"
    else if (hour == 14 && min == 30) return "🕝"
    else if (hour == 15 && min == 0) return "🕒"
    else if (hour == 15 && min == 30) return "🕞"
    else if (hour == 16 && min == 0) return "🕓"
    else if (hour == 16 && min == 30) return "🕟"
    else if (hour == 17 && min == 0) return "🕔"
    else if (hour == 17 && min == 30) return "🕠"
    else if (hour == 18 && min == 0) return "🕕"
    else if (hour == 18 && min == 30) return "🕡"
    else if (hour == 19 && min == 0) return "🕖"
    else if (hour == 19 && min == 30) return "🕢"
    else if (hour == 20 && min == 0) return "🕗"
    else if (hour == 20 && min == 30) return "🕣"
    else if (hour == 21 && min == 0) return "🕘"
    else if (hour == 21 && min == 30) return "🕤"
    else if (hour == 22 && min == 0) return "🕙"
  }

  static daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
  }

  static dateToRealMonth(month) {
    return month + 1
  }
  static realToDateMonth(month) {
    return month - 1
  }

  static timeFix(time) {
    if (Number(time) < 10) {
      return `0${String(time)}`
    } else {
      return String(time)
    }
  }

  static getRateSmiles(mark) {
    switch (mark) {
      case Mark.Like:
        return "👍"

      case Mark.Dislike:
        return "👎"

      case Mark.Neutral:
        return "😐"

      case Mark.Skipped:
        return "🚫"
    }
  }

  static getCurrentDayStats() {
    const date = new Date()
    return {
      year: date.getFullYear(),
      monthDate: date.getMonth(),
      monthReal: Helpers.dateToRealMonth(date.getMonth()),
      day: date.getDate(),
    }
  }
}
