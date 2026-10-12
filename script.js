(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const layers = {
    compute: { number:'01', icon:'▦', title:'Compute & scheduling', description:'Resource scheduling, node readiness and workload placement for shared HPC and AI clusters. Connect scheduler state with actual node health and workload behavior.', tags:['Slurm','OpenPBS','Linux','GPU nodes'], focus:'SCHEDULER → NODE → WORKLOAD' },
    collective: { number:'02', icon:'⌘', title:'GPU software & collectives', description:'Investigating distributed GPU workloads across CUDA runtime behavior, NCCL collective communication, topology and inter-node paths.', tags:['CUDA','NCCL','GPU diagnostics','Topology'], focus:'GPU → COLLECTIVE → FABRIC' },
    benchmark: { number:'03', icon:'↗', title:'Benchmarking & analysis', description:'Build repeatable tests, capture a baseline, vary concurrency and access patterns, then interpret results across the storage-to-compute path.', tags:['FIO','iperf3','HPL','Metrics'], focus:'BASELINE → MEASURE → COMPARE' },
    network: { number:'04', icon:'⌁', title:'Network & data movement', description:'Validate connectivity, bandwidth, RDMA/data path assumptions and client-to-storage reachability. Separate a transport bottleneck from a storage or application issue.', tags:['Ethernet','RDMA concepts','LNet','S3 data path'], focus:'LINK → TRANSPORT → DATA PATH' },
    operations: { number:'05', icon:'◎', title:'Operations & observability', description:'Production incident handling grounded in clear timelines, logs, telemetry, impact communication, vendor engagement and follow-through to permanent corrective actions.', tags:['RCA','SLA / SLO','Monitoring','Runbooks'], focus:'DETECT → MITIGATE → PREVENT' }
  };
  const tabs = [...document.querySelectorAll('.tool-tab')];
  const setLayer = key => {
    const layer = layers[key];
    if (!layer) return;
    document.getElementById('tool-counter').textContent = 'LAYER / ' + layer.number;
    document.getElementById('tool-icon').textContent = layer.icon;
    document.getElementById('tool-title').textContent = layer.title;
    document.getElementById('tool-description').textContent = layer.description;
    document.getElementById('tool-focus').textContent = 'FOCUS: ' + layer.focus;
    const tags = document.getElementById('tool-tags');
    tags.replaceChildren(...layer.tags.map(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      return span;
    }));
    tabs.forEach(tab => {
      const active = tab.dataset.tool === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setLayer(tab.dataset.tool));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const nextIndex = (index + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      setLayer(tabs[nextIndex].dataset.tool);
    });
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const revealTargets = document.querySelectorAll('.about-grid, .gpu-card, .future-banner, .work-card, .storage-card, .tool-panel, .principle-list article, .contact-aside');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .1 });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // Architecture lab workflow interactivity.
  const workflowData = {
    gpu: {
      label: 'WORKFLOW / COLLECTIVE COMMUNICATION',
      title: 'GPU-to-GPU traffic across a high-speed fabric',
      summary: 'Simplified distributed-training path: ranks exchange tensor data through NCCL. Actual algorithms and transports depend on topology, configuration and environment.',
      stages: ['Rank / GPU', 'Collective', 'Network', 'Peer GPU'],
      nodes: [
        {id:'gpu0',x:35,y:110,w:205,h:135,title:'COMPUTE NODE A',sub:'Rank 0 · GPU 0',kind:'gpu'},
        {id:'nccl',x:365,y:125,w:255,h:95,title:'NCCL COLLECTIVE',sub:'Reduce / All-reduce / All-gather',kind:'runtime'},
        {id:'fabric',x:410,y:285,w:165,h:75,title:'HIGH-SPEED FABRIC',sub:'InfiniBand / Ethernet',kind:'network'},
        {id:'gpu1',x:760,y:110,w:205,h:135,title:'COMPUTE NODE B',sub:'Rank 1 · GPU 1',kind:'gpu'}
      ],
      edges: [{from:'gpu0',to:'nccl',label:'GPU buffers'},{from:'nccl',to:'fabric',label:'cross-node transport'},{from:'fabric',to:'gpu1',label:'peer rank data'}],
      steps: [
        {heading:'GPU rank creates work',description:'The application launches GPU work and reaches a communication point, such as an all-reduce. Rank placement and GPU/NIC topology influence the path.',note:'Confirm rank placement, GPU health, topology awareness and expected collective size.',focus:'gpu0'},
        {heading:'Collective runtime coordinates ranks',description:'A framework call reaches NCCL; communicator setup, protocol, algorithm and topology determine how participating ranks exchange tensors.',note:'Compare NCCL logs and environment settings with the expected transport. Not every collective uses the same path.',focus:'nccl'},
        {heading:'Data crosses the selected transport',description:'For inter-node peers, communication may use InfiniBand or Ethernet. Intra-node transfers can take a different path.',note:'Check NIC counters, link health, RDMA configuration, congestion and whether the path is intra-node or inter-node.',focus:'fabric'},
        {heading:'Peer ranks complete the collective',description:'The receiving rank consumes exchanged data and ranks proceed when collective synchronization requirements are met.',note:'Look for straggler ranks, asymmetric performance, retries, errors and collective timeouts.',focus:'gpu1'}
      ]
    },
    storage: {
      label:'WORKFLOW / GPU DATA INGEST & CHECKPOINT',
      title:'GPU-to-storage traffic through a client stack',
      summary:'Conceptual path for training reads or checkpoints. The route differs between parallel-filesystem clients, object SDKs, storage designs and host/GPU I/O methods.',
      stages:['GPU / framework','I/O runtime','Client + fabric','Storage services'],
      nodes: [
        {id:'gpu0',x:30,y:112,w:195,h:122,title:'GPU WORKLOAD',sub:'Training / checkpoint',kind:'gpu'},
        {id:'runtime',x:280,y:135,w:195,h:96,title:'I/O RUNTIME',sub:'POSIX / cuFile / SDK',kind:'runtime'},
        {id:'fabric',x:535,y:285,w:170,h:75,title:'NETWORK FABRIC',sub:'TCP / supported RDMA',kind:'network'},
        {id:'storage',x:760,y:112,w:205,h:122,title:'PARALLEL STORAGE',sub:'Metadata + data services',kind:'storage'}
      ],
      edges: [{from:'gpu0',to:'runtime',label:'buffer / I/O request'},{from:'runtime',to:'fabric',label:'client data path'},{from:'fabric',to:'storage',label:'request + payload'}],
      steps: [
        {heading:'Workload requests data',description:'The input pipeline reads training records or the framework writes a checkpoint. Access size, concurrency and metadata patterns shape I/O.',note:'Characterize access pattern, file sizes, reader count, checkpoint cadence and aggregate demand.',focus:'gpu0'},
        {heading:'Application chooses its I/O path',description:'The workload uses POSIX, a client library, object SDK or a supported GPU-aware path such as cuFile/GDS where configured.',note:'Confirm API, mount/client version, I/O method and GPU-aware path eligibility.',focus:'runtime'},
        {heading:'Request moves over host and fabric',description:'Depending on the stack, control and data traffic traverse configured NICs, transport and client processes.',note:'Compare app timings with iperf3 and host metrics; keep isolated-network results separate from storage throughput.',focus:'fabric'},
        {heading:'Storage resolves and serves data',description:'Storage services handle metadata/data operations and return payloads or persist writes. Internal routing is product-specific.',note:'Correlate client latency with metadata, data service, media, queue depth and per-node imbalance.',focus:'storage'}
      ]
    },
    gds: {
      label:'WORKFLOW / GPU-DIRECT STORAGE',
      title:'A supported GPU Direct Storage path',
      summary:'GDS can enable supported storage↔GPU movement with fewer CPU bounce-buffer copies. Support depends on compatible GPU, driver, filesystem/client, transport and topology.',
      stages:['Application buffer','cuFile / GDS','Supported data path','Storage'],
      nodes: [
        {id:'gpu0',x:30,y:118,w:195,h:120,title:'GPU MEMORY',sub:'Application buffer / HBM',kind:'gpu'},
        {id:'gds',x:285,y:133,w:210,h:94,title:'GDS SOFTWARE PATH',sub:'cuFile + supported stack',kind:'runtime'},
        {id:'fabric',x:540,y:285,w:170,h:75,title:'COMPATIBLE TRANSPORT',sub:'Platform dependent',kind:'network'},
        {id:'storage',x:760,y:118,w:205,h:120,title:'STORAGE BACKEND',sub:'Supported filesystem / target',kind:'storage'}
      ],
      edges: [{from:'gpu0',to:'gds',label:'GPU buffer + I/O'},{from:'gds',to:'fabric',label:'eligible data path'},{from:'fabric',to:'storage',label:'storage payload'}],
      steps: [
        {heading:'Application identifies GPU I/O',description:'The application allocates or uses GPU memory and submits eligible I/O through a supported API such as cuFile.',note:'Confirm the actual application API; not every workload, operation or filesystem can use GDS.',focus:'gpu0'},
        {heading:'GDS coordinates I/O',description:'The runtime and kernel/storage stack determine which implementation is available for the specific platform and operation.',note:'Check GPU/driver versions, GDS components, filesystem/client support and diagnostic output.',focus:'gds'},
        {heading:'Eligible data path transfers payload',description:'On a supported direct path, data can move without a required CPU bounce-buffer copy. Other operations may stage through host memory or fall back.',note:'Use diagnostics and controlled measurements to establish the path; throughput alone does not prove GDS use.',focus:'fabric'},
        {heading:'Validate end-to-end improvement',description:'The destination buffer becomes available, but benefits depend on I/O size, concurrency, topology and the actual bottleneck.',note:'Compare baseline and GDS reads/writes for throughput, latency, CPU use and GPU starvation.',focus:'storage'}
      ]
    }
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const scene = document.getElementById('architecture-scene');
  const packetLayer = document.getElementById('packet-layer');
  const stagebar = document.getElementById('flow-stagebar');
  const flowTabs = [...document.querySelectorAll('.lab-tab')];
  const playButton = document.getElementById('play-flow');
  const stepButton = document.getElementById('step-flow');
  const resetButton = document.getElementById('reset-flow');
  const speedSlider = document.getElementById('speed-range');
  let currentFlow = 'gpu', currentStep = 0, animationFrame = 0, lastTime = 0, progress = 0, running = false, speed = 1;
  let currentNodes = [], packetDots = [], svgPaths = [], focusNode = '';
  const svgEl = (tag, attrs = {}, value = '') => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,String(v)));
    if (value) el.textContent = value;
    return el;
  };
  const addText = (parent,x,y,value,klass,extra={}) => parent.appendChild(svgEl('text',{x,y,class:klass,...extra},value));
  const findNode = id => currentNodes.find(n => n.id === id);
  function anchor(n,side) {
    if (side === 'left') return {x:n.x,y:n.y+n.h/2};
    if (side === 'right') return {x:n.x+n.w,y:n.y+n.h/2};
    if (side === 'top') return {x:n.x+n.w/2,y:n.y};
    return {x:n.x+n.w/2,y:n.y+n.h};
  }
  function makeRoute(a,b,index) {
    let start,end;
    if (index === 1 && a.y < b.y) {start=anchor(a,'bottom');end=anchor(b,'top');}
    else if (index === 1 && a.y > b.y) {start=anchor(a,'top');end=anchor(b,'bottom');}
    else {start=anchor(a,'right');end=anchor(b,'left');}
    if (Math.abs(end.x-start.x) < 30 || Math.abs(end.y-start.y) > 40) {
      const bend=(start.x+end.x)/2;
      return {d:`M ${start.x} ${start.y} C ${bend} ${start.y}, ${bend} ${end.y}, ${end.x} ${end.y}`,start,end};
    }
    return {d:`M ${start.x} ${start.y} L ${end.x} ${end.y}`,start,end};
  }
  function pointOn(route,t) {return {x:route.start.x+(route.end.x-route.start.x)*t,y:route.start.y+(route.end.y-route.start.y)*t};}
  function drawScene() {
    if (!scene || !packetLayer) return;
    scene.replaceChildren();packetLayer.replaceChildren();packetDots=[];svgPaths=[];
    const data=workflowData[currentFlow];currentNodes=data.nodes;
    const defs=svgEl('defs'),marker=svgEl('marker',{id:'flowArrow',markerWidth:8,markerHeight:8,refX:6,refY:3,orient:'auto',markerUnits:'userSpaceOnUse'});
    marker.appendChild(svgEl('path',{d:'M0,0 L0,6 L7,3 z',fill:'#68d9cf'}));defs.appendChild(marker);scene.appendChild(defs);
    data.edges.forEach((edge,i)=>{
      const route=makeRoute(findNode(edge.from),findNode(edge.to),i);
      const path=svgEl('path',{d:route.d,class:'arch-path data-path','marker-end':'url(#flowArrow)'});
      scene.appendChild(path);svgPaths.push({path,edge});
      const mid=pointOn(route,.5);addText(scene,mid.x,mid.y-10,edge.label,'edge-label',{'text-anchor':'middle'});
      const dot=svgEl('circle',{cx:route.start.x,cy:route.start.y,r:5,class:'packet-dot'});packetLayer.appendChild(dot);packetDots.push({dot,route,index:i});
    });
    currentNodes.forEach(n=>{
      const g=svgEl('g',{class:'arch-node node-'+n.kind,'data-node':n.id});
      g.appendChild(svgEl('rect',{x:n.x,y:n.y,width:n.w,height:n.h,rx:5,class:'node-shell'}));
      g.appendChild(svgEl('rect',{x:n.x+12,y:n.y+13,width:28,height:25,rx:3,class:'node-icon-bg'}));
      addText(g,n.x+26,n.y+29,n.kind==='gpu'?'GPU':n.kind==='storage'?'PFS':n.kind==='network'?'NIC':'API','node-icon',{'text-anchor':'middle'});
      addText(g,n.x+n.w/2,n.y+61,n.title,'node-title',{'text-anchor':'middle'});
      addText(g,n.x+n.w/2,n.y+82,n.sub.length>29?n.sub.slice(0,28)+'…':n.sub,'node-subtitle',{'text-anchor':'middle'});
      if(n.kind==='gpu') for(let i=0;i<3;i++) g.appendChild(svgEl('rect',{x:n.x+n.w/2-26+i*19,y:n.y+n.h-26,width:12,height:8,rx:1,class:'gpu-memory-block'}));
      else if(n.kind==='storage') for(let i=0;i<3;i++) g.appendChild(svgEl('rect',{x:n.x+n.w/2-31,y:n.y+n.h-30+i*7,width:62,height:4,rx:1,class:'storage-block'}));
      else g.appendChild(svgEl('path',{d:`M ${n.x+n.w/2-21} ${n.y+n.h-20} h42`,class:'node-baseline'}));
      scene.appendChild(g);
    });
    focusNode=data.steps[currentStep].focus;highlightScene();
  }
  function highlightScene() {
    if (!scene) return;
    scene.querySelectorAll('.arch-node').forEach(n=>n.classList.toggle('node-focus',n.dataset.node===focusNode));
    svgPaths.forEach(({path,edge})=>path.classList.toggle('path-focus',edge.from===focusNode||edge.to===focusNode));
  }
  function updateStep() {
    const d=workflowData[currentFlow],s=d.steps[currentStep];
    document.getElementById('flow-label').textContent=d.label;
    document.getElementById('flow-title').textContent=d.title;
    document.getElementById('flow-summary').textContent=d.summary;
    stagebar.replaceChildren(...d.stages.map((v,i)=>{const span=document.createElement('span');span.textContent=String(i+1).padStart(2,'0')+' · '+v;if(i===currentStep)span.classList.add('stage-active');return span;}));
    document.getElementById('step-count').textContent='STEP '+String(currentStep+1).padStart(2,'0')+' / 04';
    document.getElementById('step-progress-bar').style.width=((currentStep+1)/4*100)+'%';
    document.getElementById('step-icon').textContent=String(currentStep+1).padStart(2,'0');
    document.getElementById('step-heading').textContent=s.heading;
    document.getElementById('step-description').textContent=s.description;
    document.getElementById('step-note').textContent=s.note;
    focusNode=s.focus;highlightScene();
  }
  function stopFlow() {running=false;if(animationFrame)cancelAnimationFrame(animationFrame);animationFrame=0;lastTime=0;if(playButton)playButton.textContent='▶ Play flow';}
  function animateFlow(now) {
    if (!running) return;
    if (!lastTime) lastTime=now;
    progress+=(now-lastTime)*.00022*speed;lastTime=now;
    const count=workflowData[currentFlow].edges.length,edgeIndex=Math.floor(progress),fraction=progress-edgeIndex;
    packetDots.forEach(({dot,route,index})=>{const t=index===edgeIndex?fraction:index<edgeIndex?1:0,p=pointOn(route,Math.max(0,Math.min(1,t)));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity',index===edgeIndex?1:index<edgeIndex?.18:.05);});
    if(progress>=count){progress=0;currentStep=(currentStep+1)%4;updateStep();}
    animationFrame=requestAnimationFrame(animateFlow);
  }
  function chooseFlow(key) {
    if(!workflowData[key])return;stopFlow();currentFlow=key;currentStep=0;progress=0;
    flowTabs.forEach(b=>{const active=b.dataset.flow===key;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
    drawScene();updateStep();
  }
  flowTabs.forEach(b=>b.addEventListener('click',()=>chooseFlow(b.dataset.flow)));
  if(playButton)playButton.addEventListener('click',()=>{if(running){stopFlow();return;}running=true;lastTime=0;playButton.textContent='Ⅱ Pause flow';animationFrame=requestAnimationFrame(animateFlow);});
  if(stepButton)stepButton.addEventListener('click',()=>{stopFlow();currentStep=(currentStep+1)%4;progress=0;updateStep();packetDots.forEach(({dot,route,index})=>{const p=pointOn(route,index===currentStep?1:0);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity',index===currentStep?1:.15);});});
  if(resetButton)resetButton.addEventListener('click',()=>chooseFlow(currentFlow));
  if(speedSlider)speedSlider.addEventListener('input',()=>{speed=Number(speedSlider.value)/3;document.getElementById('speed-value').textContent=speed.toFixed(1).replace(/\.0$/,'')+'×';});
  const explodedLayers={
    gpu:{title:'GPU accelerators',text:'Validate GPU health, memory pressure, clocks, thermals, PCIe/NVLink topology and workload placement before assuming storage is the bottleneck.',checks:['nvidia-smi','GPU topology','ECC / Xid events']},
    pcie:{title:'PCIe / NVLink fabric',text:'The path between GPUs, host CPUs and NICs depends on system design. GPU peer access and NIC affinity can influence collective and I/O performance.',checks:['nvidia-smi topo -m','PCIe link state','NUMA locality']},
    host:{title:'CPU / host memory',text:'Host memory and CPU cores can remain on the critical path for orchestration, data preparation, interrupts, buffering and CPU-staged I/O.',checks:['numactl','CPU utilization','Memory bandwidth']},
    nic:{title:'NIC / DPU / HCA',text:'The network adapter and its driver/firmware determine practical transport features. Validate fabric protocol, routing, congestion and peer topology.',checks:['Link counters','RDMA health','NIC ↔ GPU affinity']},
    software:{title:'OS / drivers / runtime',text:'Application libraries, kernel modules, GPU driver, network stack, filesystem client and configuration need to be compatible and observable.',checks:['Driver matrix','Kernel logs','Runtime diagnostics']}
  };
  const explodedButtons=[...document.querySelectorAll('.exploded-layer')];
  function chooseLayer(key) {
    const item=explodedLayers[key];if(!item)return;
    explodedButtons.forEach(b=>{const active=b.dataset.layer===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const root=document.getElementById('layer-detail');root.replaceChildren();
    const title=document.createElement('strong');title.textContent=item.title;root.appendChild(title);
    const p=document.createElement('p');p.textContent=item.text;root.appendChild(p);
    const checks=document.createElement('div');checks.className='layer-checks';
    item.checks.forEach(v=>{const span=document.createElement('span');span.textContent=v;checks.appendChild(span);});root.appendChild(checks);
  }
  explodedButtons.forEach(b=>b.addEventListener('click',()=>chooseLayer(b.dataset.layer)));
  const gdsButtons=[...document.querySelectorAll('.gds-mode')];
  const gdsText={gds:'Illustrative GDS path: software and compatible hardware coordinate movement to/from GPU memory without a required CPU bounce-buffer copy on the supported path.',staged:'Illustrative CPU-staged path: data commonly passes through host memory before being copied to/from GPU memory. Exact behavior depends on application APIs and storage stack.'};
  gdsButtons.forEach(b=>b.addEventListener('click',()=>{gdsButtons.forEach(x=>x.classList.toggle('active',x===b));document.getElementById('gds-mode-explainer').textContent=gdsText[b.dataset.gds];document.querySelector('.gds-path').dataset.mode=b.dataset.gds;}));
  const densitySelect=document.getElementById('density-select');
  if(densitySelect)densitySelect.addEventListener('change',()=>{document.body.classList.toggle('density-large',densitySelect.value==='large');document.body.classList.toggle('density-compact',densitySelect.value==='compact');});
  chooseFlow('gpu');chooseLayer('gpu');

})();