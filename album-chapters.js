// Stable IDs preserve existing album links while the collections evolve.
export const key = name => name.toLowerCase().replace(/\.[^.]+$/,'').replace(/[^a-z0-9&]/g,'');
export const chapters = [
 {id:'together',title:'The Crew',description:'Selfies, portraits, friends, group shots, and first- and last-day memories.',cover:'rainydaygroupphoto'},
 {id:'raceway',title:'Life at the Raceway',description:'Working, downtime, snacks, games, tube antics, and unexpected moments.',cover:'anthonyandliamworkingconveyor'},
 {id:'beyond',title:'Around the Farm',description:'Views, changing skies, flowers, equipment, little details, animals, and farm adventures.',cover:'flowerviewofraceway'},
 {id:'tablet',title:'The Tablet Archives',description:'Snapshots from the clock-in tablet.',cover:'clockintablet1'}
];
const farm = /view|sunset|goldenhour|rainy|atnight|nightphoto|flower|tractor|grindermixer|racewayfromthebottom|racewayinterior|sidevi[ed]|racewayimage|stairs|storagearea|parking|customerlot|bench|sign|walkie|locker|heightstick|broom|enterhere|wharehousedoor|tube|coins?stacked|possum|frog|paraglider|bird|mascot|pigadeli|cluckndogs|finalcleaning|graintill/;
const life = /working|conveyor|pushing|pusher|ticket|cleaning|carrying|csrrying|pickingtube|pickinguptube|grabbingtube|fillingtube|inflatingtube|helping|onbreak|eating|food|chating|convo|roblox|playinggame|slushy|chillin|cookie|caramelapple|onphonecall|laying|sitting|unexpected|funny|awkward|goofy|quirky|trash|monkeypose|makingface|madface|handcuff|arresting|aresting|fakeflood|brokenbroom|mysteriouschild|rippingbaby|watermelon|show.*tip|gianttip|jumpking|climing|climbing|goingdown|tube/;
const crew = /and|with|&|group|selfie|crewphoto|firstday|lastday|lasttimegoingdown|finalshift|farewell|friend|asguest|asaguest|visitfrom|closeup|smiling|lookingatcamera|lookinguptocamera|posing|nonchalant|kawai|photoofmicheal|hoodie|crying|employeepicture/;
export function tags(name){
 const stem=key(name);
 // Preserve the original clock-in collection exactly.
 if(/^clockintablet/.test(stem))return ['tablet'];
 if(/halloween|costume(?!r)|boobasket|dayofthedead|diadelosmuertos|dogdays|dogdayz|guestdog/.test(stem))return [];
 const result=[];
 if(crew.test(stem))result.push('together');
 if(life.test(stem))result.push('raceway');
 if(farm.test(stem))result.push('beyond');
 // Remaining named portraits and small-group photographs belong with the crew.
 if(!result.length)result.push('together');
 return result;
}
