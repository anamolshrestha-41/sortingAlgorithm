const arrayContainer= document.getElementById('array');
const textStatus = document.getElementById('status');
let array=[];
let size=prompt("Enter size of an array");
if(size>30){
    size= prompt("Size maximum is 30");
}
const speed= document.getElementById('speed');

//Generating an array
function generateArray(){
    array= Array.from({length:size}, ()=>
        Math.floor(Math.random()*100+5));
        renderingArray();
        textStatus.innerText=`Array is ready for sorting...`
}

//Rendering an array
async function renderingArray(workingRegion=[] , sortedRegion=[]){
arrayContainer.innerHTML="";
array.forEach((value, index)=>{
const bar= document.createElement('div');
bar.classList.add('bar');
bar.style.height=`${value*3}px`;
bar.innerText=value;
bar.title=`Value-->${value}`;
if(workingRegion.includes(index)) bar.classList.add('working');
if(sortedRegion.includes(index)) bar.classList.add('sorted');
arrayContainer.appendChild(bar);
}
);
}



//Bubble Sort
async function bubbleSorting(){
textStatus.innerText=`Bubble Sort Starting.....`
for(let i=0; i<array.length;i++){
    for(let j=0; j<array.length-i-1; j++){
        renderingArray([j, j+1]);
        textStatus.innerText=`Comparing ${array[j]} and ${array[j+1]}`
        await sleep(getSpeed());
        if(array[j]>array[j+1]){
            [array[j], array[j+1]]= [array[j+1], array[j]];
            textStatus.innerText=`Swapped ${array[j+1]} and ${j+1}`
            renderingArray([j, j+1]);
            await sleep(200);
        }
    }
}
renderingArray([], Array.from(array.keys()));
textStatus.innerText=`Bubble Sorting End...`
}

async function selectionSorting() {
    textStatus.innerText=`Selection Sort Starting...`
    for(let i=0; i<array.length; i++){
        let minIndex=i;
        for(let j=i+1; j<array.length; j++){
            renderingArray([minIndex,j]);
            textStatus.innerText=`comparing ${array[j]} and ${array[j+1]}`
            await sleep(getSpeed());
            if(array[j]<array[minIndex])
                minIndex=j;
            }
            if(minIndex!==i){
                [array[i], array[minIndex]]= [array[minIndex], array[i]];
                renderingArray([i, minIndex]);
                textStatus.innerText=`Swapped ${array[minIndex]} and ${array[i]}`
                await sleep(getSpeed());
            }
        }
    
    renderingArray([], Array.from(array.keys()));
    textStatus.innerText=`Selection sorted end!!...`
}
async function insertionSorting(){
    textStatus.innerText=`Insertion Sorting is Starting soon...`
    await sleep(getSpeed());
    for(let i=1; i<array.length; i++){
        let temp=array[i];
        let j=i-1;
        while(j>=0 && array[j]>temp){
            array[j+1]=array[j];
            renderingArray([j, j+1]);
            j--;
            textStatus.innerText=`Swapped ${temp} and ${array[j+1]}`
            await sleep(getSpeed());
                }
        array[j+1]=temp;
        renderingArray([j, j+1]);
    }
    renderingArray([], Array.from(array.keys()));
    textStatus.innerText=`Insertion is stopped!!`
}


async function startSorting() {
    const algorithms= document.getElementById('algorithms').value;
    if(algorithms=='bubbleSort') await bubbleSorting();
    if(algorithms=='selectionSort') await selectionSorting();
    if(algorithms==='insertionSort') await insertionSorting();
}
//time;
async function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve, ms));
}
function getSpeed(){
    return parseInt(speed.value);
}
generateArray();