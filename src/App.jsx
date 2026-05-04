import { useEffect, useState } from "react"

import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Bio from './pages/Bio.jsx'
import Trainings from './pages/Trainings.jsx'
import Interests from './pages/Interests.jsx'
import Projects from './pages/Projects.jsx'
import Skills from './pages/Skills.jsx'
import Contacts from './pages/Contacts.jsx'
import Footer from "./components/Footer.jsx"

import settings from "./data/settings.json"

import { getAssetURL } from "./utils/utils.js"

function getDefaultTheme() {
  const hour = new Date().getHours()
  return hour >= 8 && hour < 19 ? 'theme-tirage' : 'theme-negatif'
}

export default function App() {
  const [theme, setTheme] = useState(getDefaultTheme)

  useEffect(() => {
    document.title = settings.title
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme(t => t === 'theme-tirage' ? 'theme-negatif' : 'theme-tirage')

  return (
    <>
      <Nav cv={settings.cv} theme={theme} toggleTheme={toggleTheme} />
      <main className="prose prose-stone !max-w-none w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
      <Hero firstname={settings.firstname} lastname={settings.lastname} intro={settings.intro} intro_competences={settings.intro_competences}/>
        <Skills skills={settings.skills}/>
        <Projects projects={settings.projects} />
        <Bio bio={settings.biography} portrait={getAssetURL("media", settings.portrait)}/>
        <Trainings trainings={settings.trainings}/>
        <Interests interests={settings.interests}/>
        <Contacts contacts={settings.contacts}/>
      </main >
      <Footer />

    </>
  )

}


