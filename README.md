# Frontend

## Requirements

Startup the backend functions following the instructions in [our backend repository](https://github.com/MSPR2-2026/Backend/).

## Deploying the frontend

Create the kubernetes deployment and its associated service with:
```sh
kubectl apply -f kube-deployment.yaml
# Wait for the pods relat3ed to the deployment to be ready
kubectl wait --for=condition=available deployment/frontend
```

Make it accessible in your browser by port-forwarding the service with:
```sh
kubectl port-forward svc/frontend 8081:80
```

The application will now be accessible at <http://127.0.0.1:8081>.

## Deploying the frontend (using devenv)

Create the kubernetes resources and port-forward using:
```sh
devenv processes up
```

