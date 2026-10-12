# Siddhesh Kachkure — HPC × AI Infrastructure Portfolio

A responsive, interaction-rich personal portfolio for HPC storage, GPU compute infrastructure, performance engineering and customer-facing service delivery.

## Design & features
- Dark, technical visual identity with custom CSS illustrations of a GPU cluster and storage data layer.
- Responsive navigation and layout for desktop, tablet and mobile.
- GPU platform timeline covering A100, L40, H100, H200 and B200, with GB300 and Vera Rubin presented as future learning goals.
- Interactive technical toolkit with layer tabs for scheduling, GPU collectives, benchmarking, networking and operations.
- Dedicated sections for WEKA, DDN EXAScaler/Lustre, IBM Storage Scale, Cloudian/S3, POCs, operations and engineering approach.
- Reduced-motion support, semantic sections, accessible labels and metadata for link previews.
- Plain HTML/CSS/JavaScript; no framework build step is needed for GitHub Pages.

## Local preview
Open `index.html` in a browser, or run any static HTTP server from this directory.

## Personalization checklist
- Add the current resume URL if you want a visible resume download link.
- Add approved public case studies, anonymized benchmark charts, certifications and talks when ready.
- Review the wording of platform exposure and project descriptions before publishing.
- Only add customer names, screenshots, diagrams or performance figures that are approved for public sharing.

## Deploy
GitHub Pages can serve the site directly from the repository root on the configured publishing branch.


## Interactive architecture lab (added in the follow-up PR)
The portfolio includes a browser-based learning/illustration lab for:
- GPU-to-GPU collective traffic (framework/NCCL/ranks and high-speed network).
- GPU-to-storage data access and checkpoint paths.
- An illustrative GPUDirect Storage (GDS) versus CPU-staged path comparison.
- Clickable exploded server layer view (GPU, PCIe/NVLink, host memory, NIC/HCA and software).
- Clickable storage data-path stack, workflow step explanations, packet-flow animation, play/pause, single-step, reset and speed control.
- Comfortable / compact / large reading-density modes.
- Experience and selected credentials based on the supplied résumé.

Diagrams are schematic explanatory models. They do not represent a packet capture, a specific customer topology, vendor certification or guaranteed direct path. GDS eligibility and data movement must be confirmed against the actual GPU, driver, storage client/filesystem, transport, topology and diagnostics. Review certification expiry/validity and public wording before sharing broadly.
