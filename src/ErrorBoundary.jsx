import React from 'react';
import {RefreshCw} from 'lucide-react';

export class ErrorBoundary extends React.Component{
 constructor(props){super(props);this.state={error:null}}
 static getDerivedStateFromError(error){return {error}}
 componentDidCatch(error,info){console.error('VokabelHero konnte die Ansicht nicht anzeigen:',error,info)}
 render(){if(!this.state.error)return this.props.children;return <main className="app-error" role="alert"><div>🦉</div><h1>Hoppla – die Seite konnte nicht geladen werden.</h1><p>Deine Lernstände sind weiterhin gespeichert. Lade die App neu und versuche es noch einmal.</p><details><summary>Technische Information</summary><code>{this.state.error.message}</code></details><button onClick={()=>location.reload()}><RefreshCw/> App neu laden</button></main>}
}
