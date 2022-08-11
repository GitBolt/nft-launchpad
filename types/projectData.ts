import { web3 } from '@project-serum/anchor';

export interface ProjectData {
  id: number,
  name: string,
  description: string,
  logo: string | null,
  banner: string | null,
  twitter_username: string,
  discord_invite: string | null,
  created_at: string,
  candymachine_id?: web3.PublicKey
  error?: string | null
}

export type Row = {
  title: string,
  content: string
};
export interface FaqData {
  title: string,
  rows: Row[]
}

export type NavItem = {
  text: string,
  link: string,
};
export interface Header {
  title: string,
  bgColor: string,
  fontColor: string,
  items: NavItem[],
  spacing: string,
}

export interface Section {
  title: string,
  content: string,
  align: string
  image: string | null
  imageAlign: string | null
  bgColor: string
  fontColor: string
  wideImage: boolean
}

export interface SiteData {
  id?: number,
  bgColor: string,
  primaryFontColor: string,
  secondaryFontColor: string,
  buttonBgColor: string,
  buttonFontColor: string
  fontFamily: string,
  header: null | Header
  sections: null | Section[],
  faqSection: null | FaqData,
  align: string
}

export interface Project {
  projectData: ProjectData
  siteData: SiteData
  network: string
}
