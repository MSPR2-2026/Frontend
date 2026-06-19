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

  processes.front-port-forward = {
    after = [ "front:create" ];
    exec = /* sh */ ''
      kubectl port-forward svc/frontend 8081:80
    '';
    ready = {
      http.get.port = 8081;
      initial_delay = 1;
    };
  };
}
