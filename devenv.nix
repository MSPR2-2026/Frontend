{
  languages.javascript = {
    enable = true;
    lsp.enable = false;
    nodejs.enable = true;
    npm.enable = true;
  };

  tasks."front:create" = {
    exec = /* sh */ ''
      kubectl apply -f kube-deployment.yaml
      kubectl wait --for=condition=available deployment/frontend
    '';
  };

  tasks."traefik:install" = {
    exec = /* sh */ ''
      helm repo add traefik https://traefik.github.io/charts
      helm install traefik \
        --set providers.kubernetesCRD.allowCrossNamespace=true \
        traefik/traefik
    '';
  };

  tasks."traefik:create" = {
    after = [
      "traefik:install"
      "front:create"
    ];
    exec = /* sh */ ''
      kubectl apply -f traefik.yaml
    '';
  };

  processes.traefik-port-forward = {
    after = [ "traefik:create" ];
    exec = /* sh */ ''
      kubectl port-forward svc/traefik 8081:80
    '';
    ready = {
      http.get.port = 8081;
      initial_delay = 1;
    };
  };
}
