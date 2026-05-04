# Terraform Deployment

This directory now contains the real Terraform configuration used by the Deploy pipeline.

What Terraform provisions:

- Kubernetes namespace
- Application ConfigMap and Secret
- PostgreSQL StatefulSet and headless Service
- Backend Deployment and NodePort Service
- Frontend Deployment and NodePort Service

Deploy flow:

1. Jenkins builds and tests the project
2. Jenkins builds Docker images
3. Jenkins runs Terraform from a `hashicorp/terraform` container to provision Kubernetes resources
4. Jenkins runs Ansible playbooks to update deployment images and verify rollouts

Example local validation:

```bash
docker run --rm \
	-v "$PWD:/workspace" \
	-v "$KUBECONFIG:/tmp/kubeconfig:ro" \
	-w /workspace/terraform \
	hashicorp/terraform:1.9.8 init

docker run --rm \
	-v "$PWD:/workspace" \
	-v "$KUBECONFIG:/tmp/kubeconfig:ro" \
	-w /workspace/terraform \
	hashicorp/terraform:1.9.8 validate
```