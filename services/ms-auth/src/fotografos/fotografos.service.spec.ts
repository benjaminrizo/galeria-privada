import * as bcrypt from 'bcryptjs';
import { FotografosService } from './fotografos.service';

/**
 * Lo que se prueba aquí son invariantes de seguridad del agregado Fotógrafo
 * (AG-01): la contraseña nunca se guarda en claro (RNF-03) y el correo es
 * único. Son reglas que, si se rompen, no fallan de forma visible.
 */
describe('FotografosService', () => {
  let repositorio: any;
  let jwt: any;
  let servicio: FotografosService;

  beforeEach(() => {
    repositorio = {
      findOneBy: jest.fn().mockResolvedValue(null),
      existsBy: jest.fn().mockResolvedValue(false),
      create: jest.fn((datos: any) => ({ id: 'id-de-prueba', ...datos })),
      save: jest.fn(async (entidad: any) => entidad),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token-falso') };
    servicio = new FotografosService(repositorio, jwt);
  });

  const datos = { nombre: 'Gianka', correo: 'G@Correo.com', password: 'una-clave-larga' } as any;

  it('guarda la contraseña como hash y nunca en texto plano', async () => {
    await servicio.registrar(datos);

    const guardado = repositorio.save.mock.calls[0][0];
    expect(guardado.passwordHash).toBeDefined();
    expect(guardado.passwordHash).not.toBe(datos.password);
    expect(guardado).not.toHaveProperty('password');
    // Y el hash tiene que ser verificable: no vale guardar cualquier cosa.
    await expect(bcrypt.compare(datos.password, guardado.passwordHash)).resolves.toBe(true);
  });

  it('normaliza el correo a minúsculas antes de guardarlo', async () => {
    await servicio.registrar(datos);
    expect(repositorio.save.mock.calls[0][0].correo).toBe('g@correo.com');
  });

  it('rechaza un correo ya registrado con CORREO_DUPLICADO', async () => {
    repositorio.existsBy.mockResolvedValue(true);

    await expect(servicio.registrar(datos)).rejects.toMatchObject({
      response: { codigo: 'CORREO_DUPLICADO' },
    });
  });

  it('da el mismo error si el correo no existe que si la contraseña está mal', async () => {
    // Importa que sea el mismo: un error distinto revelaría qué correos
    // existen en el sistema.
    repositorio.findOneBy.mockResolvedValue(null);
    const correoDesconocido = servicio
      .iniciarSesion({ correo: 'nadie@correo.com', password: 'x' } as any)
      .catch((e) => e.response.codigo);

    repositorio.findOneBy.mockResolvedValue({
      id: 'uno',
      correo: 'g@correo.com',
      nombre: 'Gianka',
      passwordHash: await bcrypt.hash('la-correcta', 10),
    });
    const claveIncorrecta = servicio
      .iniciarSesion({ correo: 'g@correo.com', password: 'la-incorrecta' } as any)
      .catch((e) => e.response.codigo);

    expect(await correoDesconocido).toBe('CREDENCIALES_INVALIDAS');
    expect(await claveIncorrecta).toBe('CREDENCIALES_INVALIDAS');
  });

  it('entrega un token cuando las credenciales son correctas', async () => {
    repositorio.findOneBy.mockResolvedValue({
      id: 'uno',
      correo: 'g@correo.com',
      nombre: 'Gianka',
      passwordHash: await bcrypt.hash('la-correcta', 10),
    });

    const resultado: any = await servicio.iniciarSesion({
      correo: 'g@correo.com',
      password: 'la-correcta',
    } as any);

    expect(resultado.token).toBe('token-falso');
    expect(JSON.stringify(resultado)).not.toContain('passwordHash');
  });
});
