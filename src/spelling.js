const normalized=value=>String(value||'').trim();
const phoneticKey=value=>normalized(value).toLocaleLowerCase().replace(/ph/g,'f').replace(/^kn/,'n').replace(/ay/g,'a').replace(/ee/g,'i').replace(/e$/,'').replace(/[^a-z]/g,'');

export function alignSpelling(expectedValue,answerValue){
 const expected=normalized(expectedValue),answer=normalized(answerValue),rows=expected.length+1,cols=answer.length+1;
 const matrix=Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>i+j));
 for(let i=1;i<rows;i++)for(let j=1;j<cols;j++)matrix[i][j]=Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+(expected[i-1].toLocaleLowerCase()===answer[j-1].toLocaleLowerCase()?0:1));
 const result=[];let i=expected.length,j=answer.length;
 while(i||j){
  if(i&&j&&matrix[i][j]===matrix[i-1][j-1]+(expected[i-1].toLocaleLowerCase()===answer[j-1].toLocaleLowerCase()?0:1)){result.unshift({expected:expected[i-1],actual:answer[j-1],type:expected[i-1]===answer[j-1]?'correct':expected[i-1].toLocaleLowerCase()===answer[j-1].toLocaleLowerCase()?'case':'replace'});i--;j--}
  else if(j&&matrix[i][j]===matrix[i][j-1]+1){result.unshift({expected:'',actual:answer[j-1],type:'extra'});j--}
  else{result.unshift({expected:expected[i-1],actual:'',type:'missing'});i--}
 }
 return result;
}

export function classifySpellingError(expected,answer){
 const exact=normalized(expected),given=normalized(answer);
 if(exact===given)return {type:'correct',label:'Richtig',message:'Perfekt geschrieben!'};
 if(exact.toLocaleLowerCase()===given.toLocaleLowerCase())return {type:'capitalization',label:'Groß-/Kleinschreibung',message:'Fast! Achte auf Groß- und Kleinschreibung.'};
  if(exact.replace(/[’']/g,'').toLocaleLowerCase()===given.replace(/[’']/g,'').toLocaleLowerCase())return {type:'punctuation',label:'Apostroph oder Zeichen',message:'Fast! Ein Apostroph oder Satzzeichen fehlt.'};
  if(given.length>2&&phoneticKey(exact)===phoneticKey(given))return {type:'phonetic',label:'Nach Gehör geschrieben',message:'Du hast gut hingehört! Die englische Schreibweise sieht etwas anders aus.'};
 if(exact.length===given.length&&[...exact].some((character,index)=>index<exact.length-1&&character===given[index+1]&&exact[index+1]===given[index]))return {type:'transposed',label:'Buchstaben vertauscht',message:'Fast! Zwei Buchstaben sind vertauscht.'};
 const alignment=alignSpelling(exact,given),missing=alignment.filter(item=>item.type==='missing').length,extra=alignment.filter(item=>item.type==='extra').length;
 if(missing&&!extra)return {type:'missing',label:'Buchstabe fehlt',message:`Fast! ${missing===1?'Ein Buchstabe fehlt.':`${missing} Buchstaben fehlen.`}`};
 if(extra&&!missing)return {type:'extra',label:'Buchstabe zu viel',message:`Fast! ${extra===1?'Ein Buchstabe ist zu viel.':`${extra} Buchstaben sind zu viel.`}`};
 return {type:'spelling',label:'Schreibweise',message:'Fast! Vergleiche die markierten Buchstaben.'};
}
