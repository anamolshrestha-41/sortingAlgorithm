const arrayContainer = document.getElementById('array');
const textStatus = document.getElementById('status');
let array = [];
let size = 20;
const speed = document.getElementById('speed');
const arraySizeInput = document.getElementById('arraySize') || { value: 20 };
const sizeValueDisplay = document.getElementById('sizeValue');
const darkModeToggle = document.getElementById('darkModeToggle');

// Enhanced features variables
let comparisons = 0;
let swaps = 0;
let startTime = 0;
let isRaceMode = false;
let raceArrays = [[], []];
let raceStats = [{comparisons: 0, swaps: 0, startTime: 0}, {comparisons: 0, swaps: 0, startTime: 0}];
let is3DMode = false;
let isGameMode = false;
let gameScore = 0;
let gameStreak = 0;
let currentBet = null;
let isNeonMode = false;
let matrixInterval = null;

// Initialize dark mode from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Toggle dark mode
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

// Initialize theme on page load
initTheme();

// Generate sound effects
let audioContext = null;
function playSound(type) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'compare') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'swap') {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    } catch (e) {
        // Silent fail for audio issues
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case 'g': generateArray(); break;
        case 's': startSorting(); break;
        case 'r': toggleRaceMode(); break;
        case 'c': toggleCustomInput(); break;
        case 'e': exportResults(); break;
        case '?': toggleShortcutsHelp(); break;
        case '3': toggleVisualizationMode(); break;
        case 'l': toggleLeaderboard(); break;
        case 'n': toggleNeonMode(); break;
        case 'm': toggleMatrixRain(); break;
    }
});

// Toggle shortcuts help
function toggleShortcutsHelp() {
    const help = document.getElementById('shortcutsHelp');
    if (help) {
        help.classList.toggle('show');
        setTimeout(() => help.classList.remove('show'), 3000);
    }
}

// Update size when array size input changes
if (arraySizeInput) {
    arraySizeInput.addEventListener('input', function() {
        size = parseInt(this.value);
        if (size > 30) size = 30;
        if (sizeValueDisplay) sizeValueDisplay.textContent = size;
        generateArray();
    });
}

// Generating an array
function generateArray(){
    array = Array.from({length:size}, () => Math.floor(Math.random()*100+5));
    renderingArray();
    textStatus.innerText = `Array is ready for sorting...`;
    resetStats();
    if (isRaceMode) {
        raceArrays[0] = [...array];
        raceArrays[1] = [...array];
        renderRaceArrays();
    }
}

// Reset statistics
function resetStats() {
    comparisons = 0;
    swaps = 0;
    startTime = 0;
    updateStats();
    resetProgress();
}

// Update statistics display
function updateStats() {
    const compEl = document.getElementById('comparisons');
    const swapEl = document.getElementById('swaps');
    const timerEl = document.getElementById('timer');
    
    if (compEl) compEl.textContent = comparisons;
    if (swapEl) swapEl.textContent = swaps;
    if (timerEl) {
        const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';
        timerEl.textContent = elapsed + 's';
    }
}

// Rendering an array with enhanced animations
async function renderingArray(workingRegion=[], sortedRegion=[], comparingRegion=[], swappingRegion=[]){
    arrayContainer.innerHTML="";
    array.forEach((value, index)=>{
        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (is3DMode) bar.classList.add('mode-3d');
        
        bar.style.height = `${value*3}px`;
        bar.innerText = value;
        bar.title = `Value: ${value} | Index: ${index}`;
        
        // Rainbow colors based on value
        const hue = (value / 100) * 360;
        bar.style.background = `hsl(${hue}, 70%, 60%)`;
        
        if(workingRegion.includes(index)) bar.classList.add('working');
        if(sortedRegion.includes(index)) bar.classList.add('sorted');
        if(comparingRegion.includes(index)) bar.classList.add('comparing');
        if(swappingRegion.includes(index)) bar.classList.add('swapping');
        
        arrayContainer.appendChild(bar);
    });
    updateStats();
}

// Enhanced Bubble Sort with sound and animations
async function bubbleSorting(arr = array, isRace = false, raceIndex = 0){
    if (!startTime) startTime = Date.now();
    
    textStatus.innerText = `Bubble Sort Starting.....`;
    const totalIterations = arr.length * (arr.length - 1) / 2;
    let currentIteration = 0;
    let localComparisons = 0, localSwaps = 0;

    for(let i = 0; i < arr.length; i++){
        for(let j = 0; j < arr.length - i - 1; j++){
            localComparisons++;
            if (!isRace) {
                comparisons++;
                renderingArray([j, j+1], [], [j, j+1]);
                textStatus.innerText = `Comparing ${arr[j]} and ${arr[j+1]}`;
                playSound('compare');
            } else {
                raceStats[raceIndex].comparisons++;
                renderRaceArray(raceIndex, [j, j+1], [], [j, j+1]);
            }
            
            await sleep(getSpeed());
            
            if(arr[j] > arr[j+1]){
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
                localSwaps++;
                
                if (!isRace) {
                    swaps++;
                    renderingArray([j, j+1], [], [], [j, j+1]);
                    textStatus.innerText = `Swapped ${arr[j]} and ${arr[j+1]}`;
                    playSound('swap');
                } else {
                    raceStats[raceIndex].swaps++;
                    renderRaceArray(raceIndex, [j, j+1], [], [], [j, j+1]);
                }
                
                await sleep(200);
            }
            
            currentIteration++;
            if (!isRace) updateProgress(Math.floor((currentIteration / totalIterations) * 100));
        }
    }
    
    if (!isRace) {
        renderingArray([], Array.from(arr.keys()));
        textStatus.innerText = `Bubble Sort Complete! Comparisons: ${comparisons}, Swaps: ${swaps}`;
        updateProgress(100);
        celebrateSuccess();
    }
    
    return { comparisons: localComparisons, swaps: localSwaps, time: Date.now() - startTime };
}

// Enhanced Selection Sort
async function selectionSorting(arr = array, isRace = false, raceIndex = 0) {
    if (!startTime) startTime = Date.now();
    
    textStatus.innerText = `Selection Sort Starting...`;
    const totalIterations = arr.length;
    let localComparisons = 0, localSwaps = 0;
    
    for(let i = 0; i < arr.length; i++){
        let minIndex = i;
        for(let j = i + 1; j < arr.length; j++){
            localComparisons++;
            
            if (!isRace) {
                comparisons++;
                renderingArray([minIndex, j], [], [minIndex, j]);
                textStatus.innerText = `Comparing ${arr[j]} and ${arr[minIndex]}`;
                playSound('compare');
            } else {
                raceStats[raceIndex].comparisons++;
                renderRaceArray(raceIndex, [minIndex, j], [], [minIndex, j]);
            }
            
            await sleep(getSpeed());
            
            if(arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        if(minIndex !== i){
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            localSwaps++;
            
            if (!isRace) {
                swaps++;
                renderingArray([i, minIndex], [], [], [i, minIndex]);
                textStatus.innerText = `Swapped ${arr[i]} and ${arr[minIndex]}`;
                playSound('swap');
            } else {
                raceStats[raceIndex].swaps++;
                renderRaceArray(raceIndex, [i, minIndex], [], [], [i, minIndex]);
            }
            
            await sleep(getSpeed());
        }
        
        if (!isRace) updateProgress(Math.floor(((i + 1) / totalIterations) * 100));
    }
    
    if (!isRace) {
        renderingArray([], Array.from(arr.keys()));
        textStatus.innerText = `Selection Sort Complete! Comparisons: ${comparisons}, Swaps: ${swaps}`;
        updateProgress(100);
        celebrateSuccess();
    }
    
    return { comparisons: localComparisons, swaps: localSwaps, time: Date.now() - startTime };
}

// Enhanced Insertion Sort
async function insertionSorting(arr = array, isRace = false, raceIndex = 0){
    if (!startTime) startTime = Date.now();
    
    textStatus.innerText = `Insertion Sort Starting...`;
    const totalIterations = arr.length - 1;
    let localComparisons = 0, localSwaps = 0;
    
    for(let i = 1; i < arr.length; i++){
        let temp = arr[i];
        let j = i - 1;
        
        while(j >= 0 && arr[j] > temp){
            localComparisons++;
            localSwaps++;
            
            arr[j + 1] = arr[j];
            
            if (!isRace) {
                comparisons++;
                swaps++;
                renderingArray([j, j + 1], [], [j, j + 1], [j, j + 1]);
                textStatus.innerText = `Moving ${arr[j]} to position ${j + 1}`;
                playSound('swap');
            } else {
                raceStats[raceIndex].comparisons++;
                raceStats[raceIndex].swaps++;
                renderRaceArray(raceIndex, [j, j + 1], [], [j, j + 1], [j, j + 1]);
            }
            
            j--;
            await sleep(getSpeed());
        }
        
        arr[j + 1] = temp;
        
        if (!isRace) {
            renderingArray([j + 1], Array.from({length: i + 1}, (_, k) => k));
            updateProgress(Math.floor((i / totalIterations) * 100));
        }
    }
    
    if (!isRace) {
        renderingArray([], Array.from(arr.keys()));
        textStatus.innerText = `Insertion Sort Complete! Comparisons: ${comparisons}, Swaps: ${swaps}`;
        updateProgress(100);
        celebrateSuccess();
    }
    
    return { comparisons: localComparisons, swaps: localSwaps, time: Date.now() - startTime };
}

// Quick Sort implementation
async function quickSorting(arr = array, low = 0, high = arr.length - 1, isRace = false, raceIndex = 0) {
    if (!startTime) startTime = Date.now();
    
    if (low < high) {
        const pi = await partition(arr, low, high, isRace, raceIndex);
        await quickSorting(arr, low, pi - 1, isRace, raceIndex);
        await quickSorting(arr, pi + 1, high, isRace, raceIndex);
    }
    
    if (low === 0 && high === arr.length - 1 && !isRace) {
        renderingArray([], Array.from(arr.keys()));
        textStatus.innerText = `Quick Sort Complete! Comparisons: ${comparisons}, Swaps: ${swaps}`;
        updateProgress(100);
        celebrateSuccess();
    }
    
    return { comparisons, swaps, time: Date.now() - startTime };
}

async function partition(arr, low, high, isRace, raceIndex) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (!isRace) {
            comparisons++;
            renderingArray([j, high], [], [j, high]);
            textStatus.innerText = `Comparing ${arr[j]} with pivot ${pivot}`;
            playSound('compare');
        } else {
            raceStats[raceIndex].comparisons++;
            renderRaceArray(raceIndex, [j, high], [], [j, high]);
        }
        
        await sleep(getSpeed());
        
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            
            if (!isRace) {
                swaps++;
                renderingArray([i, j], [], [], [i, j]);
                playSound('swap');
            } else {
                raceStats[raceIndex].swaps++;
                renderRaceArray(raceIndex, [i, j], [], [], [i, j]);
            }
            
            await sleep(200);
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    
    if (!isRace) {
        swaps++;
        renderingArray([i + 1, high], [], [], [i + 1, high]);
        playSound('swap');
    } else {
        raceStats[raceIndex].swaps++;
        renderRaceArray(raceIndex, [i + 1, high], [], [], [i + 1, high]);
    }
    
    await sleep(200);
    return i + 1;
}

// Merge Sort implementation
async function mergeSorting(arr = array, left = 0, right = arr.length - 1, isRace = false, raceIndex = 0) {
    if (!startTime) startTime = Date.now();
    
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSorting(arr, left, mid, isRace, raceIndex);
        await mergeSorting(arr, mid + 1, right, isRace, raceIndex);
        await merge(arr, left, mid, right, isRace, raceIndex);
    }
    
    if (left === 0 && right === arr.length - 1 && !isRace) {
        renderingArray([], Array.from(arr.keys()));
        textStatus.innerText = `Merge Sort Complete! Comparisons: ${comparisons}, Swaps: ${swaps}`;
        updateProgress(100);
        celebrateSuccess();
    }
    
    return { comparisons, swaps, time: Date.now() - startTime };
}

async function merge(arr, left, mid, right, isRace, raceIndex) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
        if (!isRace) {
            comparisons++;
            renderingArray([k], [], [k]);
            textStatus.innerText = `Merging: comparing ${leftArr[i]} and ${rightArr[j]}`;
            playSound('compare');
        } else {
            raceStats[raceIndex].comparisons++;
            renderRaceArray(raceIndex, [k], [], [k]);
        }
        
        await sleep(getSpeed());
        
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        
        if (!isRace) {
            renderingArray([k], [], [], [k]);
            playSound('swap');
        } else {
            renderRaceArray(raceIndex, [k], [], [], [k]);
        }
        
        k++;
        await sleep(100);
    }
    
    while (i < leftArr.length) {
        arr[k] = leftArr[i];
        if (!isRace) renderingArray([k], [], [], [k]);
        else renderRaceArray(raceIndex, [k], [], [], [k]);
        i++; k++;
        await sleep(50);
    }
    
    while (j < rightArr.length) {
        arr[k] = rightArr[j];
        if (!isRace) renderingArray([k], [], [], [k]);
        else renderRaceArray(raceIndex, [k], [], [], [k]);
        j++; k++;
        await sleep(50);
    }
}

async function startSorting() {
    if (isRaceMode) {
        startRace();
        return;
    }
    
    resetStats();
    startTime = Date.now();
    
    const algorithm = document.getElementById('algorithms').value;
    
    switch(algorithm) {
        case 'bubbleSort': await bubbleSorting(); break;
        case 'selectionSort': await selectionSorting(); break;
        case 'insertionSort': await insertionSorting(); break;
        case 'quickSort': await quickSorting(); break;
        case 'mergeSort': await mergeSorting(); break;
    }
}

//time;
async function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve, ms));
}
function getSpeed(){
    return parseInt(speed.value);
}

// Progress bar functions
function updateProgress(percent) {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill && progressPercent) {
        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    }
}

function resetProgress() {
    updateProgress(0);
}

// Enhanced algorithm information
const algorithmInfo = {
    bubbleSort: {
        description: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Simple but inefficient for large datasets.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    selectionSort: {
        description: "Selection Sort divides the input list into sorted and unsorted sublists, repeatedly selecting the smallest element from the unsorted portion.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    insertionSort: {
        description: "Insertion Sort builds the final sorted array one item at a time, inserting each element into its correct position in the sorted portion.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)"
    },
    quickSort: {
        description: "Quick Sort uses divide-and-conquer strategy, selecting a pivot element and partitioning the array around it. Very efficient on average.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(log n)"
    },
    mergeSort: {
        description: "Merge Sort divides the array into halves, recursively sorts them, then merges the sorted halves. Guaranteed O(n log n) performance.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)"
    }
};

// Function to show algorithm information
function showAlgorithmInfo() {
    const algorithm = document.getElementById('algorithms').value;
    const info = algorithmInfo[algorithm];
    
    if (info) {
        document.getElementById('algoDescription').textContent = info.description;
        document.getElementById('timeComplexity').textContent = info.timeComplexity;
        document.getElementById('spaceComplexity').textContent = info.spaceComplexity;
    }
}

// Race mode functions
function toggleRaceMode() {
    isRaceMode = !isRaceMode;
    const raceContainer = document.getElementById('raceContainer');
    const normalContainer = document.getElementById('array');
    
    if (isRaceMode) {
        raceContainer.style.display = 'block';
        normalContainer.style.display = 'none';
        textStatus.innerText = 'Race Mode: Click Start to race Bubble Sort vs Quick Sort!';
        generateArray();
    } else {
        raceContainer.style.display = 'none';
        normalContainer.style.display = 'flex';
        textStatus.innerText = 'Normal Mode: Select an algorithm and start sorting!';
    }
}

function renderRaceArrays() {
    renderRaceArray(0);
    renderRaceArray(1);
}

function renderRaceArray(index, workingRegion=[], sortedRegion=[], comparingRegion=[], swappingRegion=[]) {
    const container = document.getElementById(`raceArray${index + 1}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    raceArrays[index].forEach((value, i) => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 2}px`;
        bar.innerText = value;
        
        if(workingRegion.includes(i)) bar.classList.add('working');
        if(sortedRegion.includes(i)) bar.classList.add('sorted');
        if(comparingRegion.includes(i)) bar.classList.add('comparing');
        if(swappingRegion.includes(i)) bar.classList.add('swapping');
        
        container.appendChild(bar);
    });
    
    // Update race stats
    const timeEl = document.getElementById(`raceTime${index + 1}`);
    const swapEl = document.getElementById(`raceSwaps${index + 1}`);
    
    if (timeEl) {
        timeEl.textContent = raceStats[index].startTime ? 
            ((Date.now() - raceStats[index].startTime) / 1000).toFixed(1) + 's' : '0s';
    }
    if (swapEl) {
        swapEl.textContent = raceStats[index].swaps;
    }
}

async function startRace() {
    // Reset race stats
    raceStats = [{comparisons: 0, swaps: 0, startTime: Date.now()}, {comparisons: 0, swaps: 0, startTime: Date.now()}];
    
    textStatus.innerText = 'Race in progress: Bubble Sort vs Quick Sort!';
    
    // Start both algorithms simultaneously
    const race1 = bubbleSorting(raceArrays[0], true, 0);
    const race2 = quickSorting(raceArrays[1], 0, raceArrays[1].length - 1, true, 1);
    
    const results = await Promise.all([race1, race2]);
    
    // Determine winner
    const winner = results[0].time < results[1].time ? 'Bubble Sort' : 'Quick Sort';
    textStatus.innerText = `Race Complete! Winner: ${winner}`;
    
    // Check game result if in game mode
    if (isGameMode) checkGameResult(winner);
    
    celebrateSuccess();
}

// Custom array input functions
function toggleCustomInput() {
    const modal = document.getElementById('customInputModal');
    if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }
}

function applyCustomArray() {
    const inputEl = document.getElementById('customArrayInput');
    if (!inputEl) return;
    
    const input = inputEl.value;
    const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0 && n <= 100);
    
    if (numbers.length > 0 && numbers.length <= 30) {
        array = numbers;
        size = numbers.length;
        renderingArray();
        resetStats();
        textStatus.innerText = `Custom array loaded with ${size} elements!`;
        toggleCustomInput();
        
        if (isRaceMode) {
            raceArrays[0] = [...array];
            raceArrays[1] = [...array];
            renderRaceArrays();
        }
    } else {
        alert('Please enter 1-30 valid positive numbers (1-100) separated by commas.');
    }
}

// Export results function
function exportResults() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 600;
    
    // Background
    ctx.fillStyle = '#1A1A40';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sorting Algorithm Visualization', canvas.width / 2, 40);
    
    // Stats
    ctx.font = '16px Arial';
    const timeElapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';
    ctx.fillText(`Comparisons: ${comparisons} | Swaps: ${swaps} | Time: ${timeElapsed}s`, canvas.width / 2, 70);
    
    // Draw bars
    const barWidth = (canvas.width - 100) / array.length;
    const maxHeight = Math.max(...array);
    
    array.forEach((value, index) => {
        const barHeight = (value / maxHeight) * 400;
        const x = 50 + index * barWidth;
        const y = canvas.height - barHeight - 100;
        
        ctx.fillStyle = '#58D68D';
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth / 2, y - 5);
    });
    
    // Download
    const link = document.createElement('a');
    link.download = `sorting-result-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    textStatus.innerText = 'Results exported as image!';
}

// Enhanced celebration with multiple effects
function celebrateSuccess() {
    // Play success sound
    const successSound = document.getElementById('successSound');
    if (successSound) {
        successSound.currentTime = 0;
        successSound.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Multiple confetti bursts with different patterns
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
    
    // Main burst
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['square', 'circle'],
        scalar: 1.2
    });
    
    // Side bursts
    setTimeout(() => {
        confetti({
            particleCount: 75,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: colors
        });
        
        confetti({
            particleCount: 75,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: colors
        });
    }, 250);
    
    // Final burst from top
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.1 },
            colors: colors,
            gravity: 0.8
        });
    }, 500);
    
    // Screen flash effect
    document.body.style.animation = 'flash 0.5s ease-in-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

// Initialize algorithm info on page load
showAlgorithmInfo();

// Add flash animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
    }
`;
document.head.appendChild(style);

// Game Mode Functions
function toggleGameMode() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        updateGameScore();
    }
}

function startChallenge(bet) {
    currentBet = bet;
    isGameMode = true;
    toggleGameMode();
    
    // Start race automatically
    if (!isRaceMode) toggleRaceMode();
    startRace();
}

function updateGameScore() {
    const scoreEl = document.getElementById('score');
    const streakEl = document.getElementById('streak');
    if (scoreEl) scoreEl.textContent = gameScore;
    if (streakEl) streakEl.textContent = gameStreak;
}

function checkGameResult(winner) {
    if (!isGameMode || !currentBet) return;
    
    const won = (currentBet === 'bubble' && winner === 'Bubble Sort') || 
                (currentBet === 'quick' && winner === 'Quick Sort');
    
    if (won) {
        gameScore += 10 + gameStreak * 2;
        gameStreak++;
        createParticleEffect('win');
        textStatus.innerText += ' 🎉 You won! +' + (10 + (gameStreak-1) * 2) + ' points!';
    } else {
        gameScore = Math.max(0, gameScore - 5);
        gameStreak = 0;
        textStatus.innerText += ' 😞 You lost! -5 points';
    }
    
    isGameMode = false;
    currentBet = null;
    updateGameScore();
}

// 3D Visualization Mode
function toggleVisualizationMode() {
    is3DMode = !is3DMode;
    arrayContainer.classList.toggle('mode-3d', is3DMode);
    
    // Force re-render to apply 3D classes
    renderingArray();
    
    if (is3DMode) {
        textStatus.innerText = '3D Mode Activated! 🌟 Hover over bars to see 3D effects!';
        arrayContainer.style.transform = 'rotateX(5deg)';
    } else {
        textStatus.innerText = '3D Mode Deactivated';
        arrayContainer.style.transform = '';
    }
}

// Neon Mode
function toggleNeonMode() {
    isNeonMode = !isNeonMode;
    document.body.classList.toggle('neon-mode', isNeonMode);
    textStatus.innerText = isNeonMode ? 'Neon Mode Activated! ⚡' : 'Neon Mode Deactivated';
}

// Matrix Rain Effect
function toggleMatrixRain() {
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
        document.querySelectorAll('.matrix-rain').forEach(el => el.remove());
        textStatus.innerText = 'Matrix Rain Deactivated';
    } else {
        createMatrixRain();
        textStatus.innerText = 'Matrix Rain Activated! 🌧️';
    }
}

function createMatrixRain() {
    try {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const chars = '01';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        
        matrixInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';
            
            drops.forEach((y, i) => {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, y * fontSize);
                
                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            });
        }, 50);
    } catch (e) {
        console.warn('Matrix rain effect failed:', e);
    }
}

// Particle Effects
function createParticleEffect(type) {
    const colors = type === 'win' ? ['#00ff00', '#ffff00', '#ff00ff'] : ['#ff0000', '#ff6600'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight - 100 + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }, i * 50);
    }
}

// Leaderboard Functions
function toggleLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        loadLeaderboard();
    }
}

function loadLeaderboard() {
    try {
        const scores = JSON.parse(localStorage.getItem('sortingScores') || '[]');
        const list = document.getElementById('leaderboardList');
        
        if (list) {
            list.innerHTML = scores
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map((entry, i) => `
                    <div class="leaderboard-item">
                        <span class="leaderboard-rank">#${i + 1}</span>
                        <span>${entry.name || 'Anonymous'}</span>
                        <span>${entry.score || 0} pts</span>
                    </div>
                `).join('');
        }
    } catch (e) {
        console.warn('Error loading leaderboard:', e);
    }
}

function saveScore() {
    const nameInput = document.getElementById('playerName');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    if (!name) return alert('Please enter your name!');
    
    try {
        const scores = JSON.parse(localStorage.getItem('sortingScores') || '[]');
        scores.push({ name, score: gameScore, date: new Date().toLocaleDateString() });
        localStorage.setItem('sortingScores', JSON.stringify(scores));
        
        loadLeaderboard();
        nameInput.value = '';
        alert('Score saved!');
    } catch (e) {
        console.warn('Error saving score:', e);
        alert('Error saving score!');
    }
}

// Enhanced Array Rendering with Effects
function renderingArrayEnhanced(workingRegion=[], sortedRegion=[], comparingRegion=[], swappingRegion=[]) {
    arrayContainer.innerHTML="";
    array.forEach((value, index)=>{
        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (is3DMode) bar.classList.add('mode-3d');
        
        bar.style.height = `${value*3}px`;
        bar.innerText = value;
        bar.title = `Value: ${value} | Index: ${index}`;
        
        // Add rainbow colors for fun
        const hue = (value / 100) * 360;
        bar.style.background = `hsl(${hue}, 70%, 60%)`;
        
        if(workingRegion.includes(index)) bar.classList.add('working');
        if(sortedRegion.includes(index)) bar.classList.add('sorted');
        if(comparingRegion.includes(index)) bar.classList.add('comparing');
        if(swappingRegion.includes(index)) bar.classList.add('swapping');
        
        arrayContainer.appendChild(bar);
    });
    updateStats();
}

// Initialize
generateArray();
toggleShortcutsHelp();