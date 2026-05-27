{
  description = "Base Typescript template";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      config = {
        allowUnfree = true;
        virtualisation.docker.enable = true;
      };
    };
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs
        git
        typescript
        docker
        github-copilot-cli
      ];

      shellHook = ''
        echo "🚀 Typescript dev environment loaded"
      '';
    };
  };
}
