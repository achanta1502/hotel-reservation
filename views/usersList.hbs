<?php include 'menu.php';
require_once('config.php');
if(!isset($_SESSION["sess_userid"])){
	echo '<script type="text/javascript">location.href = "index.php";</script>';
	echo '<script type="text/javascript">alert("please login");</script>';	
}
?>
<div class="search-page search-grid-full">
    <div class="container">
        <div class="tab-content">
            <div id="userlist" class="tab-pane fade in active padded">
                    <?php
                    if(isset($_GET["deleteId"])){
                        deleteUser($_GET["deleteId"]);
                    }
                    function deleteUser($id){
                        $db = new PDO("mysql:dbname=".DBNAME.";host=".DBHOST, DBUSER, DBPASS);  
                        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
                        //$id = $db->quote($id);
                        $updateQuery =  $db->prepare("UPDATE user SET status=0 WHERE user_id=$id");  
                        $result = $updateQuery->execute();
                        //header("Location: adminmenu.php");
                    }
                    try{
                        $db = new PDO("mysql:dbname=".DBNAME.";host=".DBHOST, DBUSER, DBPASS);  
                        $pageNumber = $_GET["page"];
                        $start = $pageNumber*5 - 5;
                        $end = 5;
                        $query = $db->prepare("SELECT * FROM user where user_id > 1 and status=1 limit $start, $end");
                        $query->execute();
                        $rows=$query->fetchAll();
                        
                        if(count($rows) > 0){?>
                            <div style="overflow-x:auto;">
                                <table class="responstable">
                                    <tr>
                                        <th>USER ID</th>
                                        <th>NAME</th>
                                        <th>EMAIL</th>
                                        <th>PHONE</th>
                                        <th>STATUS</th>
                                    </tr>
                                <?php for($i=0; $i< count($rows); $i++){?>
                                    <tr>
                                        <td><?php echo $rows[$i]['user_id']?> </td>
                                        <td><?php echo $rows[$i]['name']?> </td>
                                        <td><?php echo $rows[$i]['email_id']?> </td>
                                        <td><?php echo $rows[$i]['phone']?> </td>
                                        <td>
                                            <a href="custInfo.php?id=<?php echo $rows[$i]['user_id']?>" class="btn btn-sm btn-info" data-toggle="tooltip" title="Edit & View" id="btnEdit"><span class="glyphicon glyphicon glyphicon-edit"></span></a>
                                            <a href="usersList.php?page=<?php echo $_GET['page'] ?>&deleteId=<?php echo $rows[$i]['user_id']?>" class="btn btn-sm btn-danger" data-toggle="tooltip" title="Delete" id="btnDel"  <?php if($rows[$i]['status'] == 0) echo 'disabled';?>><span class="glyphicon glyphicon-trash"></span></a>
                                        </td>
                                    </tr>
                                <?php
                            }
                        }else{
                            echo "No users.";
                        }
                   }catch(PDOException $ex){
                        echo $ex->getMessage(); 
                    }
                ?>
                </table>
                </div>
                <div>
                <nav>
				  <ul class="pagination pagination-lg">
                    
                    <?php
                    $currentPage = $_GET["page"];
                    $query = $db->prepare("SELECT * FROM user where user_id > 1 and status=1");
                    $query->execute();
                    $rows=$query->fetchAll();
                    
                     $noOfPages = ceil(count($rows)/5);
                     $i = 0;
                     ?>
                     <li><a href="usersList.php?page=<?php echo $currentPage - 1 ?>" aria-label="Previous"><span aria-hidden="true">«</span></a></li>
                     <?php
                     while($i < $noOfPages){?>
                        <li><a href="usersList.php?page=<?php echo $i+1 ?>"><?php echo $i+1 ?></a></li>
                     <?php
                        $i++;
                    }?>
					<li><a href="usersList.php?page=<?php echo $currentPage + 1 ?>" aria-label="Next"><span aria-hidden="true">»</span></a></li>
				  </ul>
				  </nav>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
;