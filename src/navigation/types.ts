import type { TimerSound } from '../types/domain'
import type { Soundscape } from '../features/sounds/soundscape'
import type { StartOptions } from '../features/timer/timerSession'

export type RootStackParamList = {
  SplashIF: undefined
  Splash: undefined
  ProfileSelection: undefined
  Login: undefined
  CheckEmail: { email: string }
  PrimaryRegister: undefined
  ResponsibleRegister: undefined
  LoginSuccess: undefined
  Home: undefined
  Profile: undefined
  Settings: undefined
  EventLog: undefined
  Reminders: { preset?: string } | undefined
  CheckIn: undefined
  Contacts: undefined
  Report: undefined
  AccessLog: undefined
  EditProfile: undefined
  Tasks: undefined
  DayPlan: undefined
  TimerPlan: { preset?: { task: string; minutes: number; steps?: string[]; taskId?: string; sound?: TimerSound } } | undefined
  TimerSound: { plan: StartOptions }
  Timer: undefined
  TimerDone: undefined
  Sounds: undefined
  DayReview: undefined
  Relax: { sound: Soundscape; minutes: number }
  Sleep: { sound: Soundscape; minutes: number }
  ReminderAlert: { title: string; reminderId?: string }
}
