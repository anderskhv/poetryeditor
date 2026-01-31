/**
 * Poetry Editor - Rhyme of the Day Widget (<5KB)
 * https://poetryeditor.com/embed
 */
(function(){
var r=[
['ember','remember'],['wonder','thunder'],['shadow','meadow'],['ocean','motion'],['golden','olden'],
['mountain','fountain'],['feather','weather'],['river','shiver'],['crystal','midnight'],['tender','surrender'],
['miracle','lyrical'],['serenade','cascade'],['ancient','patient'],['treasure','measure'],['passion','fashion'],
['garden','pardon'],['morning','warning'],['harvest','artist'],['phantom','anthem'],['wisdom','kingdom'],
['frozen','chosen'],['thunder','asunder'],['voyage','foliage'],['kindle','dwindle'],['glisten','listen'],
['shower','flower'],['season','reason'],['sunrise','surprise'],['breeze','please'],['dewdrop','teardrop'],
['butterfly','justify'],['honey','money'],['willow','pillow'],['thyme','rhyme'],['daisy','lazy'],
['summer','drummer'],['twilight','highlight'],['starry','carry'],['seashell','farewell'],['harbor','arbor'],
['lagoon','balloon'],['coral','moral'],['freedom','kingdom'],['parade','cascade'],['blazing','amazing'],
['sunset','regret'],['horizon','arisen'],['oasis','basis'],['monsoon','lagoon'],['lightning','frightening'],
['refuge','deluge'],['drought','thought'],['abundant','redundant'],['vineyard','inward'],['kernel','eternal'],
['sunflower','power'],['apple','grapple'],['autumn','fathom'],['falling','calling'],['crimson','prison'],
['sweater','better'],['maple','staple'],['pathway','gateway'],['October','sober'],['haunting','wanting'],
['moonlight','midnight'],['raven','haven'],['mystery','history'],['tombstone','backbone'],['November','remember'],
['blessing','expressing'],['together','weather'],['feast','beast'],['fireplace','marketplace'],['embers','members'],
['mittens','kittens'],['December','ember'],['winter','splinter'],['snowflake','heartache'],['jingle','mingle'],
['holly','jolly'],['evergreen','between'],['present','pleasant'],['giving','living'],['wonder','thunder'],
['miracle','lyrical'],['peaceful','meaningful'],['reflection','perfection'],['resolution','revolution'],
['whisper','glimmer'],['silence','violence'],['lantern','pattern'],['sparkle','darkle'],['blossom','awesome'],
['candle','handle'],['flutter','utter'],['beacon','weaken'],['tremble','assemble'],['nectar','vector']
];
function g(){var n=new Date(),s=new Date(n.getFullYear(),0,0);return Math.floor((n-s)/864e5)}
function t(){return r[(g()-1)%r.length]}
function c(m){var p=t(),d=m==='dark',u='https://poetryeditor.com',
s='font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:320px;padding:16px 20px;border-radius:12px;text-align:center;'+(d?'background:#1a1a1a;border:1px solid rgba(255,255,255,.1);color:#e5e5e5;':'background:#fdfcfa;border:1px solid rgba(0,0,0,.1);color:#2a2a2a;'),
w='font-family:Georgia,serif;font-size:22px;text-decoration:none;color:'+(d?'#e5e5e5':'#2a2a2a'),
l='font-size:10px;font-weight:500;text-decoration:none;opacity:.5;color:'+(d?'#e5e5e5':'#2a2a2a');
return'<div style="'+s+'"><div style="margin-bottom:12px"><span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.6">Rhyme of the Day</span></div><div style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:center;gap:8px"><a href="'+u+'/rhymes/'+p[0]+'?ref=widget" target="_blank" rel="noopener" style="'+w+'">'+p[0]+'</a><span style="font-family:Georgia,serif;font-size:18px;opacity:.4">&amp;</span><a href="'+u+'/rhymes/'+p[1]+'?ref=widget" target="_blank" rel="noopener" style="'+w+'">'+p[1]+'</a></div></div><div style="padding-top:10px;border-top:1px solid rgba(128,128,128,.2)"><a href="'+u+'?ref=widget" target="_blank" rel="noopener" style="'+l+'">Powered by Poetry Editor</a></div></div>'}
function i(){var e=document.getElementById('poetry-editor-widget');if(e)e.innerHTML=c(e.getAttribute('data-theme')||'light')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);else i()})();
