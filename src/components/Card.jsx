const Card = ({ user }) => {
  console.log("user: ", user);
  const { image, name, position, icon, text } = user;
  return (
    <div className="bg-white w-[40%] h-[40%] rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={image} alt="profile image" />
          <div className="flex flex-col items-start justify-start gap-0">
            <p>{name}</p>
            <p>{position}</p>
          </div>
        </div>
        <img src={icon} alt="icon" />
      </div>
      <p>{text}</p>
    </div>
  );
};

export default Card;
