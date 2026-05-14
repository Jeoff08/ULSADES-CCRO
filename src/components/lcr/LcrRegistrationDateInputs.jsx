import React, { useEffect, useState } from 'react'
import {
  getRegistrationDmYFromRaw,
  tryIsoFromDmyStrings,
  daysInCalendarMonth,
} from '../../lib/printUtils'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
} from '../../lib/lcrRegistrationUiKeys'

function digitsOnly(s, maxLen) {
  return String(s ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLen)
}

const numInputClass =
  'w-11 sm:w-12 text-center font-bold border border-gray-300 rounded px-1 py-0.5 text-sm bg-white focus:outline-none focus:border-[var(--primary-blue)] tabular-nums'

/**
 * DD / MM / YYYY numeric inputs for LCR supplemental editing.
 * Partial values persist on `lcrData` via configurable *_Ui keys; full valid date sets `iso` on persist.
 */
export default function LcrRegistrationDateInputs({
  valueRaw,
  savedDayUi,
  savedMonthUi,
  savedYearUi,
  onPersist,
  printDisplay,
  className = '',
  dayUiKey = LCR_REGISTRATION_DAY_UI,
  monthUiKey = LCR_REGISTRATION_MONTH_UI,
  yearUiKey = LCR_REGISTRATION_YEAR_UI,
  ariaLabelPrefix = 'Registration',
}) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    const du = String(savedDayUi ?? '').trim()
    const mu = String(savedMonthUi ?? '').trim()
    const yu = String(savedYearUi ?? '').trim()
    if (du || mu || yu) {
      setDay(du)
      setMonth(mu)
      setYear(yu)
      return
    }
    const p = getRegistrationDmYFromRaw(valueRaw)
    setDay(p.d)
    setMonth(p.m)
    setYear(p.y)
  }, [valueRaw, savedDayUi, savedMonthUi, savedYearUi])

  const persist = (dStr, mStr, yStr) => {
    const iso = tryIsoFromDmyStrings(dStr, mStr, yStr)
    onPersist({
      [dayUiKey]: dStr,
      [monthUiKey]: mStr,
      [yearUiKey]: yStr,
      iso,
    })
  }

  const onDayChange = (e) => {
    const dig = digitsOnly(e.target.value, 2)
    const mNum = parseInt(month, 10)
    const yNum = parseInt(year, 10)
    if (dig === '') {
      setDay('')
      persist('', month, year)
      return
    }
    let n = parseInt(dig, 10)
    if (!Number.isFinite(n) || n < 1) {
      setDay('')
      persist('', month, year)
      return
    }
    const maxD =
      Number.isFinite(mNum) && mNum >= 1 && mNum <= 12 && Number.isFinite(yNum) && yNum >= 1000 && yNum <= 9999
        ? daysInCalendarMonth(yNum, mNum)
        : 31
    n = Math.min(maxD, Math.min(31, Math.max(1, n)))
    const out = String(n)
    setDay(out)
    persist(out, month, year)
  }

  const onMonthChange = (e) => {
    const dig = digitsOnly(e.target.value, 2)
    if (dig === '') {
      setMonth('')
      persist(day, '', year)
      return
    }
    let n = parseInt(dig, 10)
    if (!Number.isFinite(n)) {
      setMonth('')
      persist(day, '', year)
      return
    }
    n = Math.min(12, Math.max(1, n))
    const out = String(n)
    setMonth(out)
    let dAdj = day
    const yNum = parseInt(year, 10)
    const mNum = n
    if (day !== '' && Number.isFinite(yNum) && yNum >= 1000 && yNum <= 9999) {
      const maxD = daysInCalendarMonth(yNum, mNum)
      const dNum = parseInt(day, 10)
      if (Number.isFinite(dNum) && dNum > maxD) {
        dAdj = String(maxD)
        setDay(dAdj)
      }
    }
    persist(dAdj, out, year)
  }

  const onYearChange = (e) => {
    const dig = digitsOnly(e.target.value, 4)
    if (dig === '') {
      setYear('')
      persist(day, month, '')
      return
    }
    if (dig.length < 4) {
      setYear(dig)
      persist(day, month, dig)
      return
    }
    const yNum = parseInt(dig, 10)
    if (!Number.isFinite(yNum) || yNum < 1000 || yNum > 9999) {
      setYear(dig.slice(0, 4))
      persist(day, month, dig.slice(0, 4))
      return
    }
    const out = String(yNum)
    setYear(out)
    let dAdj = day
    const mNum = parseInt(month, 10)
    if (day !== '' && Number.isFinite(mNum) && mNum >= 1 && mNum <= 12) {
      const maxD = daysInCalendarMonth(yNum, mNum)
      const dNum = parseInt(day, 10)
      if (Number.isFinite(dNum) && dNum > maxD) {
        dAdj = String(maxD)
        setDay(dAdj)
      }
    }
    persist(dAdj, month, out)
  }

  return (
    <div className={className}>
      <div className="no-print flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-bold">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD"
          aria-label={`${ariaLabelPrefix} day`}
          className={numInputClass}
          value={day}
          onChange={onDayChange}
        />
        <span className="text-gray-500 select-none">/</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="MM"
          aria-label={`${ariaLabelPrefix} month`}
          className={numInputClass}
          value={month}
          onChange={onMonthChange}
        />
        <span className="text-gray-500 select-none">/</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="YYYY"
          aria-label={`${ariaLabelPrefix} year`}
          className="w-[4.25rem] sm:w-16 text-center font-bold border border-gray-300 rounded px-1 py-0.5 text-sm bg-white focus:outline-none focus:border-[var(--primary-blue)] tabular-nums"
          value={year}
          onChange={onYearChange}
        />
      </div>
      <span className="hidden print:inline">{printDisplay}</span>
    </div>
  )
}
