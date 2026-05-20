async function isAdminUser(uid){

  const snapshot =
    await get(
      ref(
        database,
        `admins/${uid}`
      )
    );

  if(!snapshot.exists()){
    return false;
  }

  const adminRecord =
    snapshot.val();

  console.log("Admin Record:", adminRecord);

  if(adminRecord === true){
    return true;
  }

  if(
    adminRecord &&
    (
      adminRecord.approved === true ||
      adminRecord.approved === "true"
    )
  ){
    return true;
  }

  return false;

}
