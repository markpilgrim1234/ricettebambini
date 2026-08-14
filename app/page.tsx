"use client";
import { useEffect, useMemo, useState } from "react";
import recipesData from "./recipes.json";

type Recipe = { title:string; category:string; ingredients:string[]; procedure_excerpt:string; dose:string; image_url:string; source_url:string };
const recipes = recipesData as Recipe[];
function normalizeWord(value:string){
 const normalized=value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 if(normalized.length<4)return normalized;
 return normalized.replace(/(chi|che)$/,"c").replace(/(ghi|ghe)$/,"g").replace(/[aeiou]$/,"");
}
function normalizedWords(value:string){return value.split(/[^\p{L}\p{N}]+/u).map(normalizeWord).filter(Boolean)}
function containsNormalized(haystack:string,needle:string){
 const available=normalizedWords(haystack);
 return normalizedWords(needle).every(term=>available.some(word=>word===term||(term.length>=3&&word.startsWith(term))));
}
function recipeType(recipe:Recipe){const h=`${recipe.source_url} ${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase();if(/dolci-e-merende|biscott|torta|muffin|cupcake|gelato|dessert|ciambell|plumcake|cremini/.test(h))return"Dolci e merende";if(/ricette-di-pesce|salmone|merluzzo|trota|pesce|tonno|rana pescatrice|orata|nasello|sogliola/.test(h))return"Pesce";if(/ricette-di-carne|pollo|tacchino|manzo|vitello|maiale|prosciutto|carne|polpettone/.test(h))return"Carne";return"Vegetariane"}
function nutritionBalance(recipe:Recipe){
 const protein=/pollo|tacchino|manzo|vitello|maiale|pesce|salmone|merluzzo|trota|tonno|uov|ricotta|yogurt|latte|formaggio|parmigiano|legum|lenticchi|ceci|fagiol|pisell|tofu/;
 const carbs=/pasta|riso|farina|pane|pangrattato|patat|polenta|miglio|avena|cous|semola|gnocch|zucchero|biscott|banana/;
 const vitamins=/carot|zucchin|spinaci|broccol|pomodor|zucca|finocch|lattuga|verdura|frutta|mela|pera|pesca|prugna|fragol|avocado|basilico|cavol|bietol|rapa|limone|arancia/;
 let scores=[1,1,1];recipe.ingredients.forEach(item=>{const value=item.toLowerCase();if(protein.test(value))scores[0]+=1.35;if(carbs.test(value))scores[1]+=1.2;if(vitamins.test(value))scores[2]+=1.25});
 const total=scores.reduce((a,b)=>a+b,0);const rounded=scores.map(value=>Math.round(value/total*100));rounded[2]+=100-rounded.reduce((a,b)=>a+b,0);return{protein:rounded[0],carbs:rounded[1],vitamins:rounded[2]};
}
const types=["Tutte","Vegetariane","Carne","Pesce","Dolci e merende"];
const balanceProfiles=["Tutti i bilanci","Bilanciata 50/25/25","Distribuzione uniforme","Più proteica","Più ricca di carboidrati","Più ricca di vitamine"];
function matchesBalance(recipe:Recipe,profile:string){
 const b=nutritionBalance(recipe);if(profile==="Tutti i bilanci")return true;
 if(profile==="Bilanciata 50/25/25")return Math.abs(b.carbs-50)<=10&&Math.abs(b.protein-25)<=8&&Math.abs(b.vitamins-25)<=8;
 if(profile==="Distribuzione uniforme")return Math.max(b.protein,b.carbs,b.vitamins)-Math.min(b.protein,b.carbs,b.vitamins)<=10;
 if(profile==="Più proteica")return b.protein>=b.carbs+5&&b.protein>=b.vitamins+5;
 if(profile==="Più ricca di carboidrati")return b.carbs>=b.protein+5&&b.carbs>=b.vitamins+5;
 return b.vitamins>=b.protein+5&&b.vitamins>=b.carbs+5;
}

export default function Home(){
 const[query,setQuery]=useState("");const[ingredient,setIngredient]=useState("");const[type,setType]=useState("Tutte");const[maxIngredients,setMaxIngredients]=useState("Tutti");const[balanceProfile,setBalanceProfile]=useState("Tutti i bilanci");const[selected,setSelected]=useState<Recipe|null>(null);
 const filtered=useMemo(()=>recipes.filter(recipe=>{const text=`${recipe.title} ${recipe.category} ${recipe.procedure_excerpt}`;const ing=recipe.ingredients.join(" ");const q=!query.trim()||containsNormalized(text,query);const i=!ingredient.trim()||ingredient.split(",").map(v=>v.trim()).filter(Boolean).every(v=>containsNormalized(ing,v));const t=type==="Tutte"||recipeType(recipe)===type;const c=maxIngredients==="Tutti"||recipe.ingredients.length<=Number(maxIngredients);return q&&i&&t&&c&&matchesBalance(recipe,balanceProfile)}),[query,ingredient,type,maxIngredients,balanceProfile]);
 const filtersActive=Boolean(query.trim()||ingredient.trim()||type!=="Tutte"||maxIngredients!=="Tutti"||balanceProfile!=="Tutti i bilanci");
 const randomRecipe=()=>{const pool=filtered.length?filtered:recipes;setSelected(pool[Math.floor(Math.random()*pool.length)])};
 const clearFilters=()=>{setQuery("");setIngredient("");setType("Tutte");setMaxIngredients("Tutti");setBalanceProfile("Tutti i bilanci");setSelected(null)};
 useEffect(()=>{if(!selected)return;const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setSelected(null)};document.addEventListener("keydown",closeOnEscape);const previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",closeOnEscape);document.body.style.overflow=previousOverflow}},[selected]);
 return <main>
  <header className="hero"><nav className="nav-shell"><div className="brand"><img className="brand-logo" src="/brand-logo.svg" alt=""/><span>Buonissimo!</span></div><div className="nav-note">Le ricette provengono da Alimentazione Bambini, il sito sviluppato da Coop. Per informazioni sulla redazione scientifica, <a href="https://alimentazionebambini.e-coop.it/redazione/" target="_blank" rel="noreferrer">clicca qui</a>.</div></nav><section className="hero-content"><p className="eyebrow">Idee da portare in tavola · da 1 a 3 anni</p><h1>Oggi cosa<br/><em>prepariamo?</em></h1><p className="hero-credits">Sviluppato da Carlo, Elena e Marco</p><p className="hero-copy">Trova una ricetta partendo da quello che hai in frigo, oppure lascia decidere alla magia.</p><button className="magic-button" onClick={randomRecipe}><span>✦</span> Sorprendimi con una ricetta</button></section><div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/></header>
  <section className="filter-wrap" aria-label="Filtri ricette"><div className="filters">
   <label className="search-field wide"><span>Cerca una ricetta</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="es. polpette, risotto, crema…"/></label>
   <label className="search-field wide ingredient-field"><span>Cerca per ingrediente</span><input value={ingredient} onChange={e=>setIngredient(e.target.value)} placeholder="es. lenticchie, carote…"/></label>
   <label className="search-field"><span>Tipo</span><select value={type} onChange={e=>setType(e.target.value)}>{types.map(item=><option key={item}>{item}</option>)}</select></label>
   <label className="search-field"><span>Ingredienti</span><select value={maxIngredients} onChange={e=>setMaxIngredients(e.target.value)}><option>Tutti</option><option value="5">Massimo 5</option><option value="7">Massimo 7</option><option value="10">Massimo 10</option></select></label>
   <label className="search-field balance-filter"><span>Bilancio</span><select value={balanceProfile} onChange={e=>setBalanceProfile(e.target.value)}>{balanceProfiles.map(item=><option key={item}>{item}</option>)}</select></label>
   <button className="clear-button" onClick={clearFilters}>Azzera</button>
  </div>{filtersActive&&<div className="mobile-filter-status" aria-live="polite"><span><strong>{filtered.length}</strong> {filtered.length===1?"ricetta trovata":"ricette trovate"}</span><button onClick={()=>document.getElementById("recipe-results")?.scrollIntoView({behavior:"smooth",block:"start"})}>Vedi ricette</button></div>}</section>
  {selected&&<div className="recipe-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null)}}><section className="recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="random-recipe-title"><button className="dialog-close" onClick={()=>setSelected(null)} aria-label="Chiudi proposta">×</button><span className="dialog-spark" aria-hidden="true">✦</span><p className="dialog-eyebrow">La sorpresa di oggi</p><h2 id="random-recipe-title">{selected.title}</h2><p className="dialog-copy">Abbiamo scelto questa ricetta per te. Puoi aprirla senza perdere il punto in cui ti trovi nella pagina.</p><div className="dialog-actions"><a href={selected.source_url} target="_blank" rel="noreferrer">Apri la ricetta completa <span>↗</span></a><button onClick={randomRecipe}>Proponine un’altra</button></div></section></div>}
  <section className="content-shell" id="recipe-results"><div className="result-heading"><div><p className="eyebrow dark">La selezione</p><h2>{filtered.length} {filtered.length===1?"ricetta da provare":"ricette da provare"}</h2></div><p>{ingredient?`Con “${ingredient}”`:"Filtra, scegli e porta in tavola qualcosa di buono."}</p></div>
   {filtered.length?<div className="recipe-grid">{filtered.map(recipe=>{const slug=recipe.source_url.split("/").filter(Boolean).pop();const balance=nutritionBalance(recipe);return <article className="recipe-card" id={slug} key={recipe.source_url}><div className="image-wrap"><img src={recipe.image_url} alt={recipe.title} loading="lazy"/><span className={`type-badge type-${recipeType(recipe).toLowerCase().replaceAll(" ","-")}`}>{recipeType(recipe)}</span></div><div className="card-body"><div className="card-meta"><span>{recipe.ingredients.length} ingredienti</span>{recipe.dose&&<span>{recipe.dose}</span>}</div><h3>{recipe.title}</h3><details><summary>Vedi ingredienti</summary><ul>{recipe.ingredients.map((item,index)=><li key={index}>{item}</li>)}</ul>{recipe.procedure_excerpt&&<p className="procedure">{recipe.procedure_excerpt}</p>}</details><details className="nutrition-details" open><summary>Bilancio nutrizionale</summary><div className="nutrition-chart" aria-label={`Proteine ${balance.protein}%, carboidrati ${balance.carbs}%, vitamine ${balance.vitamins}%`}><span className="nutrition-protein" style={{width:`${balance.protein}%`}}/><span className="nutrition-carbs" style={{width:`${balance.carbs}%`}}/><span className="nutrition-vitamins" style={{width:`${balance.vitamins}%`}}/></div><div className="nutrition-legend"><span><i className="dot protein-dot"/>Proteine <b>{balance.protein}%</b></span><span><i className="dot carbs-dot"/>Carboidrati <b>{balance.carbs}%</b></span><span><i className="dot vitamins-dot"/>Vitamine <b>{balance.vitamins}%</b></span></div><p className="nutrition-note">Stima orientativa basata sugli ingredienti. “Vitamine” indica la quota di frutta e verdura, non una percentuale nutrizionale misurata.</p></details><a className="source-link" href={recipe.source_url} target="_blank" rel="noreferrer">Ricetta completa <span>↗</span></a></div></article>})}</div>:<div className="empty-state"><span>🥕</span><h3>Nessuna ricetta trovata</h3><p>Prova a usare un ingrediente più semplice o ad azzerare i filtri.</p><button onClick={clearFilters}>Azzera i filtri</button></div>}
  </section><footer><span>Buonissimo!</span><p>Una raccolta di ricette per bambini da 1 a 3 anni. Verifica sempre allergeni e consistenze adatte al tuo bambino.</p></footer>
 </main>
}
