export default function Narration({say,dispatch}){
  return (
    <div className="narration" aria-live="polite">
      <p>{say.text}</p>
      <div className="choices">
        {say.choices.map(ch=><button key={ch.label} onClick={()=>dispatch(ch.action)}>{ch.label}</button>)}
      </div>
    </div>
  );
}
