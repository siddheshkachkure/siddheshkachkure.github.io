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
})();