import { JwtAdapter, bcryptAdapter } from '../../config';
import { UserModel } from '../../data';
import { CustomError, RegisterUserDto, UserEntity } from '../../domain';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';


export class AuthService {

  // DI
  constructor() {}

  public async registerUser( registerUserDto: RegisterUserDto ) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if ( existUser ) throw CustomError.badRequest('Email already exist');
    
    try{
        const user = new UserModel(registerUserDto);
        //Encriptar contraseña
        user.password = bcryptAdapter.hash(registerUserDto.password);
        await user.save();
        
        const { password, ...userEnity } = UserEntity.fromObject(user);

        return{
            user: userEnity,
            token: 'ABC'
        }

    }catch (error){
        throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto:LoginUserDto){
    const user = await UserModel.findOne({ email: loginUserDto.email });
    if ( !user ) throw CustomError.badRequest('Email does not exist');

    const isMatching = bcryptAdapter.compare(loginUserDto.password,user.password);
    if ( !isMatching ) throw CustomError.badRequest('Password is not valid');

    const { password, ...userEnity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({id:user, email: user.email});

    return{
        user: userEnity,
        token: token,
    }
  }
}