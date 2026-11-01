export type RootStackParamList = {
  SplashIF: undefined
  Splash: undefined
  ProfileSelection: undefined
  Login: undefined
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
  EditProfile: undefined
  Tasks: undefined
  DayPlan: undefined
  TimerPlan: { preset?: { task: string; minutes: number; steps?: string[]; taskId?: string } } | undefined
  Timer: undefined
  TimerDone: undefined
  ReminderAlert: { title: string; reminderId?: string }
}
