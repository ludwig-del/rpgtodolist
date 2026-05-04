# Terraform Scaffold

This repository keeps a `terraform/` directory to stay aligned with the ENG23 3074 PDF flow.

Current status:

- The real deploy flow is centered on Jenkins, Ansible, and Kubernetes.
- Terraform is intentionally left as a scaffold so the repository structure stays close to the course template and example repository.
- `jenkins/Jenkinsfile_deploy` skips the Terraform stage unless `terraform/main.tf` is added later.

If you decide to implement Terraform for real, add these files here:

- `main.tf`
- `variables.tf`
- `outputs.tf`