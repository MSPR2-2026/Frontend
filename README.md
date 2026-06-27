# Frontend

## Requirements

Startup the backend functions following the instructions in [our backend repository](https://github.com/MSPR2-2026/Backend/).

## Setup

Install traefik with:
```sh
helm repo add traefik https://traefik.github.io/charts
helm install traefik \
  --set providers.kubernetesCRD.allowCrossNamespace=true \
  traefik/traefik
```

## Deploying the frontend

Create the kubernetes deployment and its associated service with:
```sh
kubectl apply -f kube-deployment.yaml
# Wait for the pods related to the deployment to be ready
kubectl wait --for=condition=available deployment/frontend
```

Create the traefik ingressroute to allow to access the frontend and the functions through a single point:
```sh
kubectl apply -f traefik.yaml
```

Make it all accessible from your browser by port-forwarding the traefik service with:
```sh
kubectl port-forward svc/traefik 8081:80
```

The application will now be accessible at <http://127.0.0.1:8081>.

## Deploying the frontend (using devenv)

Install traefik, deploy the frontend and the ingressroute and port-forward the traefik service using:
```sh
devenv processes up
```

