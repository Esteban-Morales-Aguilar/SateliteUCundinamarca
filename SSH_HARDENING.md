# SSH hardening (requiere root)

Verificar primero que la clave pública está instalada y funciona (abrir otra sesión):

```bash
ssh -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no malware@192.168.1.254
```

Si entra, aplicar en `/etc/ssh/sshd_config.d/99-spacenet.conf`:

```sshconfig
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
AuthenticationMethods publickey
PermitRootLogin no
MaxAuthTries 3
```

Luego:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

Mantener `fail2ban` activo. Considerar restringir el puerto 22 a una VPN o cambiar a un puerto no estándar (seguridad por oscuridad, solo complemento).