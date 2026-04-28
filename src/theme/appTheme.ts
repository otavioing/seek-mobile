export type AppTheme = {
  background: string;
  backgroundAlt: string;
  card: string;
  danger: string;
  tabActive: string;
  tabInactive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  buttonPrimary: string;
  buttonSecondary: string;
  link: string;
  imagePlaceholder: string;
  modalBackground: string;
  statusBar: 'light-content' | 'dark-content';
};

export const lightTheme: AppTheme = {
  background: '#E6E6E6',
  backgroundAlt: '#F6F6F6',
  card: '#FFFFFF',
  danger: '#D32F2F',
  tabActive: '#111111',
  tabInactive: '#666666',
  textPrimary: '#111111',
  textSecondary: '#333333',
  textMuted: '#666666',
  border: '#CFCFCF',
  buttonPrimary: '#007BFF',
  buttonSecondary: '#4F46E5',
  link: '#6D28D9',
  imagePlaceholder: '#D1D5DB',
  modalBackground: '#E6E6E6',
  statusBar: 'dark-content',
};

export const darkTheme: AppTheme = {
  background: '#000000',
  backgroundAlt: '#1a1a1a',
  card: '#111111',
  danger: '#ff5c5c',
  tabActive: '#FFFFFF',
  tabInactive: '#888888',
  textPrimary: '#FFFFFF',
  textSecondary: '#DDDDDD',
  textMuted: '#AAAAAA',
  border: '#333333',
  buttonPrimary: '#007BFF',
  buttonSecondary: '#4F46E5',
  link: '#A78BFA',
  imagePlaceholder: '#333333',
  modalBackground: '#000000',
  statusBar: 'light-content',
};

export const getAppTheme = (isDarkMode: boolean): AppTheme =>
  isDarkMode ? darkTheme : lightTheme;

export type CourseTheme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
  commentCard: string;
};

const lightCourseTheme: CourseTheme = {
  background: '#E6E6E6',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#4A4A4A',
  accent: '#6D28D9',
  border: '#CFCFCF',
  commentCard: '#F3F3F3',
};

const darkCourseTheme: CourseTheme = {
  background: '#000000',
  card: '#1a1a1a',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  accent: '#A78BFA',
  border: '#333333',
  commentCard: '#1a1a1a',
};

export const getCourseTheme = (isDarkMode: boolean): CourseTheme =>
  isDarkMode ? darkCourseTheme : lightCourseTheme;

export type FeedTheme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  statusBar: 'light-content' | 'dark-content';
};

const lightFeedTheme: FeedTheme = {
  background: '#E6E6E6',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#333333',
  textMuted: '#666666',
  border: '#CCCCCC',
  inputBg: '#FFFFFF',
  inputBorder: '#C7C7C7',
  inputText: '#111111',
  statusBar: 'dark-content',
};

const darkFeedTheme: FeedTheme = {
  background: '#090909',
  card: '#1a1a1a',
  textPrimary: '#FFFFFF',
  textSecondary: '#DDDDDD',
  textMuted: '#888888',
  border: '#333333',
  inputBg: '#0f0f0f',
  inputBorder: '#333333',
  inputText: '#FFFFFF',
  statusBar: 'light-content',
};

export const getFeedTheme = (isDarkMode: boolean): FeedTheme =>
  isDarkMode ? darkFeedTheme : lightFeedTheme;

export type FollowingTheme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  inputBorder: string;
  statusBarIcon: string;
};

const lightFollowingTheme: FollowingTheme = {
  background: '#E6E6E6',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#444444',
  textMuted: '#666666',
  inputBg: '#FFFFFF',
  inputBorder: '#C7C7C7',
  statusBarIcon: '#111111',
};

const darkFollowingTheme: FollowingTheme = {
  background: '#000000',
  card: '#1a1a1a',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#888888',
  inputBg: '#0f0f0f',
  inputBorder: '#333333',
  statusBarIcon: '#FFFFFF',
};

export const getFollowingTheme = (isDarkMode: boolean): FollowingTheme =>
  isDarkMode ? darkFollowingTheme : lightFollowingTheme;

export type TrendingTheme = {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBg: string;
  inputText: string;
};

const lightTrendingTheme: TrendingTheme = {
  background: '#E6E6E6',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#333333',
  textMuted: '#666666',
  border: '#CCCCCC',
  inputBg: '#FFFFFF',
  inputText: '#111111',
};

const darkTrendingTheme: TrendingTheme = {
  background: '#000000',
  card: '#1a1a1a',
  textPrimary: '#FFFFFF',
  textSecondary: '#DDDDDD',
  textMuted: '#666666',
  border: '#333333',
  inputBg: '#f0f0f0',
  inputText: '#000000',
};

export const getTrendingTheme = (isDarkMode: boolean): TrendingTheme =>
  isDarkMode ? darkTrendingTheme : lightTrendingTheme;

export type HomeLayoutTheme = {
  background: string;
  header: string;
  iconButton: string;
  icon: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  indicator: string;
  path: string;
};

const lightHomeLayoutTheme: HomeLayoutTheme = {
  background: '#E6E6E6',
  header: '#E6E6E6',
  iconButton: '#D0D0D0',
  icon: '#111111',
  tabBar: '#E6E6E6',
  tabActive: '#111111',
  tabInactive: '#666666',
  indicator: '#111111',
  path: '#111111',
};

const darkHomeLayoutTheme: HomeLayoutTheme = {
  background: '#0F0F0F',
  header: '#0F0F0F',
  iconButton: '#313131',
  icon: '#FFFFFF',
  tabBar: '#0F0F0F',
  tabActive: '#FFFFFF',
  tabInactive: '#888888',
  indicator: '#FFFFFF',
  path: '#FFFFFF',
};

export const getHomeLayoutTheme = (isDarkMode: boolean): HomeLayoutTheme =>
  isDarkMode ? darkHomeLayoutTheme : lightHomeLayoutTheme;

export type FilterTheme = {
  background: string;
  header: string;
  sectionCard: string;
  modal?: string;
  section?: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  control: string;
  controlActive: string;
  svg: string;
  svgSoft: string;
  inputBg?: string;
  inputBorder?: string;
};

const lightFilterCTheme: FilterTheme = {
  background: '#D9D9D9',
  header: '#E6E6E6',
  sectionCard: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#4B5563',
  control: '#E5E7EB',
  controlActive: '#111111',
  border: '#D1D5DB',
  svg: '#111111',
  svgSoft: '#D1D5DB',
};

const darkFilterCTheme: FilterTheme = {
  background: '#000000',
  header: '#0F0F0F',
  sectionCard: '#0F0F0F',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  control: '#313131',
  controlActive: '#E3E3E3',
  border: '#1F1F1F',
  svg: '#FFFFFF',
  svgSoft: '#E3E3E3',
};

export const getFilterCTheme = (isDarkMode: boolean): FilterTheme =>
  isDarkMode ? darkFilterCTheme : lightFilterCTheme;

const lightFilterPTheme: FilterTheme = {
  background: '#D9D9D9',
  header: '#E6E6E6',
  sectionCard: '#FFFFFF',
  modal: '#FFFFFF',
  section: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#4B5563',
  border: '#D1D5DB',
  control: '#E5E7EB',
  controlActive: '#111111',
  svg: '#111111',
  svgSoft: '#D1D5DB',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
};

const darkFilterPTheme: FilterTheme = {
  background: '#000000',
  header: '#0F0F0F',
  sectionCard: '#0F0F0F',
  modal: '#111111',
  section: '#0F0F0F',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#1F1F1F',
  control: '#313131',
  controlActive: '#E3E3E3',
  svg: '#FFFFFF',
  svgSoft: '#E3E3E3',
  inputBg: '#111111',
  inputBorder: '#222222',
};

export const getFilterPTheme = (isDarkMode: boolean): FilterTheme =>
  isDarkMode ? darkFilterPTheme : lightFilterPTheme;

const lightFilterVTheme: FilterTheme = {
  background: '#D9D9D9',
  header: '#E6E6E6',
  sectionCard: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#4B5563',
  control: '#E5E7EB',
  controlActive: '#111111',
  border: '#D1D5DB',
  svg: '#111111',
  svgSoft: '#D1D5DB',
};

const darkFilterVTheme: FilterTheme = {
  background: '#000000',
  header: '#0F0F0F',
  sectionCard: '#0F0F0F',
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  control: '#313131',
  controlActive: '#E3E3E3',
  border: '#1F1F1F',
  svg: '#FFFFFF',
  svgSoft: '#E3E3E3',
};

export const getFilterVTheme = (isDarkMode: boolean): FilterTheme =>
  isDarkMode ? darkFilterVTheme : lightFilterVTheme;

export type LoginTheme = {
  background: string;
  textPrimary: string;
  textSecondary: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  button: string;
  buttonText: string;
  link: string;
  separator: string;
  modalOverlay: string;
  modalBackground: string;
  modalBorder: string;
  modalText: string;
  modalTextSecondary: string;
  iconColor: string;
  modalBackButton: string;
  modalCancelButton: string;
  modalBorderColor: string;
};

const lightLoginTheme: LoginTheme = {
  background: '#FAFAFA',
  textPrimary: '#111111',
  textSecondary: '#666666',
  inputBackground: '#FFFFFF',
  inputBorder: '#CCCCCC',
  inputText: '#111111',
  button: '#322BF0',
  buttonText: '#FFFFFF',
  link: '#2563EB',
  separator: '#999999',
  modalOverlay: 'rgba(0,0,0,0.4)',
  modalBackground: '#f5f5f5',
  modalBorder: '#e5e5e5',
  modalText: '#111111',
  modalTextSecondary: '#666666',
  iconColor: '#999999',
  modalBackButton: '#e0e0e0',
  modalCancelButton: '#f0f0f0',
  modalBorderColor: '#bdbdbd',
};

const darkLoginTheme: LoginTheme = {
  background: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  inputBackground: '#FFFFFF',
  inputBorder: '#000000',
  inputText: '#111111',
  button: '#322BF0',
  buttonText: '#FFFFFF',
  link: '#2563EB',
  separator: '#B5B5B5',
  modalOverlay: 'rgba(0,0,0,0.6)',
  modalBackground: '#0F0F0F',
  modalBorder: '#1f2937',
  modalText: '#FFFFFF',
  modalTextSecondary: '#E5E7EB',
  iconColor: '#666666',
  modalBackButton: '#1f2937',
  modalCancelButton: '#374151',
  modalBorderColor: '#6b7280',
};

export const getLoginTheme = (isDarkMode: boolean): LoginTheme =>
  isDarkMode ? darkLoginTheme : lightLoginTheme;

export type CadastroTheme = {
  background: string;
  textPrimary: string;
  divider: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  selection: string;
  icon: string;
  cardBackground: string;
  link: string;
};

const lightCadastroTheme: CadastroTheme = {
  background: '#D9D9D9',
  textPrimary: '#111111',
  divider: '#A6A6A6',
  inputBackground: '#FFFFFF',
  inputBorder: '#000000',
  inputText: '#111111',
  placeholder: '#7A7A7A',
  selection: '#322BF0',
  icon: '#666666',
  cardBackground: '#FFFFFF',
  link: '#2563EB',
};

const darkCadastroTheme: CadastroTheme = {
  background: '#0F0F0F',
  textPrimary: '#FFFFFF',
  divider: 'rgba(255,255,255,0.5)',
  inputBackground: '#FFFFFF',
  inputBorder: '#000000',
  inputText: '#111111',
  placeholder: '#7A7A7A',
  selection: '#322BF0',
  icon: '#999999',
  cardBackground: '#FFFFFF',
  link: '#2563EB',
};

export const getCadastroTheme = (isDarkMode: boolean): CadastroTheme =>
  isDarkMode ? darkCadastroTheme : lightCadastroTheme;